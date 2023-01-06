/*
 * d.Lite - low-code platform for local-first Web/Mobile development
 * Copyright (C) 2022 CINCHEO
 *                    https://www.cincheo.com
 *                    renaud.pawlak@cincheo.com
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

Vue.component('local-storage-connector', {
    extends: editableComponent,
    template: `
        <div :id="cid">
            <component-icon v-if="edit" :type="viewModel.type"></component-icon>
            <component-badge :component="getThis()" :edit="edit" :targeted="targeted" :selected="selected"></component-badge>
            <b-badge v-if="isEditable() && viewModel.key" variant="info">{{ viewModel.key }}</b-badge>                
            <b-button v-if="isEditable()" v-b-toggle="'data-model-' + viewModel.cid" class="float-right p-0 m-0" size="sm" variant="link">Data model</b-button>
            <b-collapse v-if="isEditable()" :id="'data-model-' + viewModel.cid" style="clear: both">
                <b-form-textarea
                    v-model="value"
                    rows="1"
                    size="sm" 
                    max-rows="10"
                ></b-form-textarea>
            </b-collapse>
        </div>
    `,
    created: function () {
        this.$eventHub.$on('synchronized', (pullResult) => {
            console.info('local storage update for synchronization', this.cid, pullResult);
            if (pullResult.keys != null && Object.keys(pullResult.keys).length > 0) {
                this.update();
            }
        });
    },
    mounted: function () {
        this.update();
        this.initAutoSync();
    },
    computed: {
        computedKey: function () {
            if (this.viewModel.key == null) {
                return undefined;
            }
            const key = this.$eval(this.viewModel.key, null);
            if (Array.isArray(key) && key.some(keyChunk => keyChunk == null)) {
                return undefined;
            }
            let keyString = ide.sync.buildKeyString(key);
            if (this.viewModel.partitionKey) {
                // for a partition, the computed key is a query for all the partitions
                keyString += '::.*';
            }
            // const sharedBy = this.$eval(this.viewModel.sharedBy, null);
            // return sharedBy && sharedBy !== $collab.getLoggedUser().email ?
            //     keyString + '-$-' + sharedBy
            //     : keyString
            return keyString;
        }
    },
    watch: {
        'viewModel.autoSync': {
            handler: function () {
                this.initAutoSync();
            },
            immediate: true
        },
        computedKey: {
            handler: function () {
                this.update();
            },
            immediate: true
        },
        'viewModel.shares': {
            handler: async function () {
                await this.syncAndShare();
                this.update();
            },
            immediate: true
        },
        'viewModel.readOnlyShares': {
            handler: async function () {
                await this.syncAndShare();
                this.update();
            },
            immediate: true
        },
        value: {
            handler: function () {
                if (this.$eval(this.viewModel.query, null)) {
                    // queries are read-only
                    return;
                }
                const computedKey = this.computedKey;
                if (!computedKey) {
                    return;
                }

                if (this.viewModel.partitionKey) {
                    // clear all existing partitions and shares (could be more efficient!)
                    for (const key of this.getMatchingKeys(computedKey)) {
                        //localStorage.removeItem(key);
                        // clear the collection rather than removing the key so that it will be synced even when the
                        // partition is deleted (locally-deleted keys don't get synced otherwise)
                        localStorage.setItem(key, JSON.stringify([]));
                    }
                    for (const partition of this.getPartitions()) {
                        const valuesToStore = this.value.filter(item => item[this.viewModel.partitionKey] === partition);
                        this.storeValues(this.computedPartitionKey(partition), valuesToStore);
                    }
                } else {
                    if (this.viewModel.dataType === 'object') {
                        localStorage.setItem(computedKey, JSON.stringify(this.value));
                    } else {
                        this.storeValues(computedKey, this.value);
                    }
                }
                if (this.$eval(this.viewModel.autoSync, null)) {
                    this.syncAndShare();
                }
            },
            deep: true
        }
    },
    methods: {
        async update() {
            const computedKey = this.computedKey;
            if (!computedKey) {
                // transient storage
                return;
            }
            const query = this.$eval(this.viewModel.query, null);
            const matchingKeys = this.getMatchingKeys(computedKey);
            if (matchingKeys.length === 0) {
                this.value = undefined;
            } else {
                if (this.viewModel.dataType === 'object') {
                    if (matchingKeys.length > 1) {
                        console.error('invalid matching keys for data type in ' + this.cid, computedKey, matchingKeys);
                    }
                    this.value = JSON.parse(localStorage.getItem(matchingKeys[0]));
                } else {
                    if (matchingKeys.length > 0 || query) {
                        const mergedValue = [];
                        matchingKeys.forEach(key => {
                            try {
                                const storedValue = localStorage.getItem(key);
                                const explodedKey = ide.sync.explodeKeyString(key);
                                if (storedValue != null) {
                                    const parsedStoredValue = JSON.parse(storedValue);
                                    if (Array.isArray(parsedStoredValue)) {
                                        mergedValue.push(...parsedStoredValue.map(value => this.injectKey(value, explodedKey)));
                                    } else {
                                        mergedValue.push(this.injectKey(parsedStoredValue));
                                    }
                                }
                            } catch (e) {
                                console.error(e);
                            }
                        });
                        if (this.viewModel.partitionKey) {
                            mergedValue.sort((item1, item2) => {
                                const v1 = item1[this.viewModel.partitionKey];
                                const v2 = item2[this.viewModel.partitionKey];
                                if (v1 === v2) {
                                    return 0;
                                }
                                if (v2 > v1) {
                                    return -1;
                                } else {
                                    return 1;
                                }
                            });
                        }
                        if (!(JSON.stringify(mergedValue) === JSON.stringify(this.value))) {
                            this.value = mergedValue;
                        }
                    }
                }
            }

            if (this.value == null) {
                const defaultValue = this.$eval(this.viewModel.defaultValue, null);
                if (defaultValue != null) {
                    this.value = defaultValue;
                }
            }
        },
        storeValues(key, values) {
            if (values == null) {
                return;
            }
            const sharedByValues = $tools.collectUniqueFieldValues(values, '$sharedBy');
            if (sharedByValues.length === 0) {
                sharedByValues[0] = undefined;
            }
            for (let sharedBy of sharedByValues) {
                if (!sharedBy || sharedBy === $collab.getLoggedUser()?.email) {
                    localStorage.setItem(key, JSON.stringify(values.filter(value => !value.$sharedBy || value.$sharedBy === $collab.getLoggedUser()?.email)));
                } else {
                    localStorage.setItem(key + '-$-' + sharedBy, JSON.stringify(values.filter(value => value.$sharedBy === sharedBy)));
                }
            }
        },
        async syncAndShare() {
            await $collab.synchronize();
            let shares = this.$evalCode(this.viewModel.shares, null);
            let readOnlyShares = this.$evalCode(this.viewModel.readOnlyShares, null);
            if (shares || readOnlyShares) {
                await this.share(shares, readOnlyShares);
            }
        },
        async share(shares, readOnlyShares) {
            if ($collab.getLoggedUser() && shares && this.computedKey) {
                if (this.viewModel.partitionKey) {
                    for (const partition of this.getOwnedPartitions()) {
                        const partitionKey = this.computedPartitionKey(partition);
                        await $collab.share(
                            partitionKey,
                            Array.isArray(shares) ? (typeof shares === 'function' ? shares(partition) : shares) : shares[partition],
                            Array.isArray(readOnlyShares) ? (typeof readOnlyShares === 'function' ? readOnlyShares(partition) : readOnlyShares) : readOnlyShares[partition],
                        );
                    }
                } else {
                    await $collab.share(this.computedKey, shares, readOnlyShares);
                }
            }
        },
        getPartitions() {
            if (!this.viewModel.partitionKey) {
                return [];
            } else {
                return $tools.collectUniqueFieldValues(this.value, this.viewModel.partitionKey);
            }
        },
        getOwnedPartitions() {
            if (!this.viewModel.partitionKey) {
                return [];
            } else {
                return $tools.collectUniqueFieldValues(this.value.filter(item => !item.$sharedBy), this.viewModel.partitionKey);
            }
        },
        computedPartitionKey: function (partition) {
            if (this.viewModel.key == null) {
                return undefined;
            }
            const key = this.$eval(this.viewModel.key, null);
            if (Array.isArray(key) && key.some(keyChunk => keyChunk == null)) {
                return undefined;
            }
            let keyString = ide.sync.buildKeyString(key);
            keyString += '::' + partition;
            return keyString;
        },
        initAutoSync() {
            if (this.$eval(this.viewModel.autoSync, null)) {
                this.beforeDataChange = async () => {
                    await $collab.synchronize();
                }
            }
        },
        injectKey(target, explodedKey) {
            if (explodedKey) {
                if (!target.hasOwnProperty('$key')) {
                    Object.defineProperty(target, '$key', {enumerable: false, writable: false, value: explodedKey.key});
                }
                if (!target.hasOwnProperty('$sharedBy')) {
                    Object.defineProperty(target, '$sharedBy', {
                        enumerable: false,
                        writable: false,
                        value: explodedKey.sharedBy
                    });
                }
                //return Object.assign(target, { '$key': explodedKey.key, '$sharedBy': explodedKey.sharedBy });
                return target;
            } else {
                return target;
            }
        },
        getMatchingKeys(queryString) {
            let matchingKeys = [];
            const queryOwnerSplit = queryString.split("-$-");
            const queryChunks = queryOwnerSplit[0].split("::");
            for (let i = 0, len = localStorage.length; i < len; ++i) {
                const ownerSplit = localStorage.key(i).split("-$-");
                const chunks = ownerSplit[0].split("::");
                if (chunks.length !== queryChunks.length) {
                    continue;
                }
                if (chunks.every((chunk, index) => new RegExp(queryChunks[index]).test(chunk))) {
                    matchingKeys.push(localStorage.key(i));
                }
            }
            return matchingKeys;
        },
        propNames() {
            return [
                "cid",
                "query",
                "autoSync",
                "key",
                "shares",
                "readOnlyShares",
                "partitionKey",
                "dataType",
                "defaultValue",
                "autoIds",
                "eventHandlers"
            ];
        },
        // TODO: find another way for these static methods
        customActionNames() {
            return [
                {value: "rename", text: "rename(newName)"},
                {text: " --- Arrays ---", disabled: true},
                {value: "getStoredArray", text: "getStoredArray(key, [sharedBy])"},
                {value: "setStoredArray", text: "setStoredArray(key, array)"},
                {value: "addToStoredArray", text: "addToStoredArray(key, data)"},
                {value: "removeFromStoredArray", text: "removeFromStoredArray(key, data)"},
                {value: "removeStoredArray", text: "removeStoredArray(key)"},
                {value: "replaceInStoredArray", text: "replaceInStoredArray(key, data)"}
            ];
        },
        async clear() {
            if (!this.$eval(this.viewModel.query, null)) {
                localStorage.removeItem(this.computedKey);
                await this.update();
            }
        },
        rename(newName) {
            if (!this.$eval(this.viewModel.query, null)) {
                // queries are read-only
                return;
            }
            // TODO: I don't think it works
            localStorage.setItem(newName, JSON.stringify(this.value));
        },
        customPropDescriptors() {
            return {
                query: {
                    type: 'checkbox',
                    label: 'Query',
                    editable: true,
                    literalOnly: true,
                    description: 'If set, this connector is a query to the local storage (read-only data access). Keys and shared by expressions can be regexp to match existing storage keys - when several keys are matched, the data is merged into a unique collection.'
                },
                autoSync: {
                    type: 'checkbox',
                    label: 'Auto sync',
                    editable: true,
                    hidden: viewModel => viewModel.query,
                    description: 'If set, this connector automatically synchronizes before and after each data change.'
                },
                autoIds: {
                    type: 'checkbox',
                    label: 'Auto IDs',
                    editable: true,
                    literalOnly: true,
                    category: "data",
                    hidden: viewModel => viewModel.query,
                    description: 'If set, this connector automatically injects IDs to the data objects.'
                },
                key: {
                    type: 'text',
                    editable: true,
                    description: 'A string representing key used to store the data in the local storage',
                    manualApply: true
                },
                sharedBy: {
                    type: 'text',
                    editable: true,
                    description: 'A user ID - the given user must share the key with you to have access',
                    manualApply: true,
                    category: 'sharing',
                    hidden: viewModel => viewModel.dataType !== 'array'
                },
                shares: {
                    type: 'code/javascript',
                    editable: true,
                    label: 'Shares (read/write permissions)',
                    description: 'A list of user ids to share this data with (read/write permissions)',
                    hidden: viewModel => viewModel.query || viewModel.dataType !== 'array',
                    manualApply: true,
                    literalOnly: true,
                    category: 'sharing',
                },
                readOnlyShares: {
                    type: 'code/javascript',
                    editable: true,
                    label: 'Shares (read-only permission)',
                    description: 'A list of user ids to share this data with (read-only permission)',
                    hidden: viewModel => viewModel.query || viewModel.dataType !== 'array',
                    manualApply: true,
                    literalOnly: true,
                    category: 'sharing'
                },
                partitionKey: {
                    type: 'text',
                    label: 'Partition key (for arrays only)',
                    editable: true,
                    manualApply: true,
                    literalOnly: true,
                    hidden: viewModel => viewModel.query || viewModel.dataType !== 'array',
                    description: 'If a partition key is defined, the data, which is an array, will be partitioned in several sub-keys (main-key::partition-key), which can be shared and synchronized independently'
                },
                remote: {
                    type: 'checkbox',
                    editable: true,
                    description: 'If set, the storage is only remote (on the server) and no data is stored locally in the browser - the user must be authenticated'
                },
                dataType: {
                    type: 'select',
                    options: viewModel => components.allowedDataTypes(viewModel.type),
                    category: 'data',
                    description: 'The data type that can will be stored in the storage. Note that only objects and arrays are supported at this point'
                },
                defaultValue: {
                    type: 'text',
                    editable: true,
                    description: 'The default value of the data model when the data does not exist yet in the local storage or when its value is not valid'
                }
            }
        }

    }
});


