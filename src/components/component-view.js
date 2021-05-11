Vue.component('component-view', {
    template: `
        <div :ref="viewModel.cid" v-if="viewModel" :style="edit ? style : ''">
            <div v-if="edit && locked === undefined"
                @click="onDropZoneClicked"
                ref="drop-zone"
                :class="dropZoneClass()"
                @drop="onDrop($event)"
                @mouseover="onDragEnter"
                @mouseleave="onDragLeave"
                @dragenter="onDragEnter"
                @dragleave="onDragLeave"
                @dragover.prevent
                @dragenter.prevent
            >
            </div>
            <collection-view ref="component" :cid="viewModel.cid" v-if="viewModel.type == 'CollectionView'">
            </collection-view>
            
            <instance-view ref="component" :cid="viewModel.cid" v-if="viewModel.type == 'InstanceView'">
            </instance-view>

            <table-view ref="component" :cid="viewModel.cid" v-if="viewModel.type == 'TableView'">
            </table-view>

             <split-view ref="component" :cid="viewModel.cid" v-if="viewModel.type == 'SplitView'">
             </split-view>
             
             <navbar-view ref="component" :cid="viewModel.cid" v-if="viewModel.type == 'NavbarView'">
             </navbar-view>

             <dialog-view ref="component" :cid="viewModel.cid" v-if="viewModel.type == 'DialogView'">
             </dialog-view>
             
             <container-view ref="component" :cid="viewModel.cid" v-if="viewModel.type == 'ContainerView'">
             </container-view>

             <collection-provider ref="component" :cid="viewModel.cid" v-if="viewModel.type == 'CollectionProvider'">
             </collection-provider>

             <instance-provider ref="component" :cid="viewModel.cid" v-if="viewModel.type == 'InstanceProvider'">
             </instance-provider>

             <input-view ref="component" :cid="viewModel.cid" v-if="viewModel.type == 'InputView'">
             </input-view>

             <button-view ref="component" :cid="viewModel.cid" v-if="viewModel.type == 'ButtonView'">
             </button-view>

             <checkbox-view ref="component" :cid="viewModel.cid" v-if="viewModel.type == 'CheckboxView'">
             </checkbox-view>

             <select-view ref="component" :cid="viewModel.cid" v-if="viewModel.type == 'SelectView'">
             </select-view>

             <card-view ref="component" :cid="viewModel.cid" v-if="viewModel.type == 'CardView'">
             </card-view>

             <image-view ref="component" :cid="viewModel.cid" v-if="viewModel.type == 'ImageView'">
             </image-view>

             <chart-view ref="component" :cid="viewModel.cid" v-if="viewModel.type == 'ChartView'">
             </chart-view>

             <application-connector ref="component" :cid="viewModel.cid" v-if="viewModel.type == 'ApplicationConnector'">
             </application-connector>
           
             <b-alert v-if="viewModel.type == null" show variant="danger">Undefined component type.</b-alert>
             
        </div>
        <div v-else>
            <div :class="dropZoneClass()" v-if="edit && locked === undefined" 
                @drop="onDrop($event)"
                @click="onDropZoneClicked"
                @mouseover="onDragEnter"
                @mouseleave="onDragLeave"
                @dragenter="onDragEnter"
                @dragleave="onDragLeave"
                @dragover.prevent
                @dragenter.prevent
                >
            </div>
            <b-alert v-else show variant="warning">{{ locked ? locked : 'Requested component does not exist.' }}</b-alert>
        </div>       
    `,
    props: ['cid', 'keyInParent', 'indexInKey', 'locked'],
    data: function() {
        return {
            viewModel: undefined,
            edit: ide.editMode,
            components: components.getComponentModels(),
            selectableComponents: this.getSelectableComponents(),
            hOver: false,
            highLighted: false,
            style: 'border: solid transparent 1px',
            location: ''
        }
    },
    watch: {
        'components': {
            handler: function () {
                this.selectableComponents = this.getSelectableComponents();
            },
            deep: true
        },
        cid: function(cid) { this.updateViewModel(); }
    },
    created: function () {
        this.$eventHub.$on('edit', (edit) => {
            this.edit = edit;
        });
        this.$eventHub.$on('target-location-selected', (location) => {
            this.hOver = false;
            if (!location) {
                this.highLighted = false;
            } else {
                this.highLighted = (location.cid === this.$parent.cid && location.key === this.keyInParent && location.index === this.indexInKey);
            }
        });
    },
    mounted: function () {
        this.updateViewModel();
    },
    methods: {
        dropZoneClass() {
            return this.hOver || this.highLighted ? 'active-drop-zone' : 'drop-zone';
        },
        showBuilder(id) {
            ide.setTargetLocation({
                cid: this.$parent.cid,
                key: this.keyInParent,
                index: this.indexInKey
            });
            this.$bvModal.show(id);
        },
        createComponent(type) {
            console.info("createComponent", type, this.keyInParent, this.$parent.cid);
            const viewModel = components.createComponentModel(type);
            components.registerComponentModel(viewModel);
            console.info("viewModel", viewModel);
            components.setChild({
                cid: this.$parent.cid,
                key: this.keyInParent,
                index: this.indexInKey
            }, viewModel);
            ide.selectComponent(viewModel.cid);
        },
        setComponent(cid) {
            const containerView = components.getContainerView(cid);
            if(containerView) {
                let keyInParent = containerView.keyInParent;
                components.unsetChild({
                    cid: containerView.$parent.cid,
                    key: keyInParent,
                    index: containerView.indexInKey
                });
            }
            const viewModel = components.getComponentModel(cid);
            components.setChild({
                cid: this.$parent.cid,
                key: this.keyInParent,
                index: this.indexInKey
            }, viewModel);
            ide.selectComponent(viewModel.cid);
        },
        getSelectableComponents() {
            return Object.values(this.components ? this.components : components.getComponentModels()).filter(component => component.type !== 'NavbarView');
        },
        updateViewModel() {
            if (this.viewModel && this.viewModel.cid === this.cid) {
                return;
            }
            console.info("[" + this.$options.name + "] get viewModel", this.cid);
            this.viewModel = components.getComponentModel(this.cid);
            console.info("[" + this.$options.name + "] viewModel", this.viewModel);
        },
        onDrop(evt) {
            this.onDragLeave();
            const type = evt.dataTransfer.getData('type');
            if (type) {
                console.info("drop type", type);
                this.createComponent(type);
            } else {
                const cid = evt.dataTransfer.getData('cid');
                if (cid) {
                    console.info("drop component", cid);
                    this.setComponent(cid);
                }
                const builder = evt.dataTransfer.getData('builder');
                if (builder) {
                    console.info("drop builder", builder);
                    this.showBuilder(builder);
                }
            }

        },
        onDragEnter() {
            console.info("on drag enter");
            this.location = this.$parent.cid + '.' + this.keyInParent + (typeof this.indexInKey === 'number' ? '[' + this.indexInKey + ']' : '');
            this.hOver = true;
            if (this.$parent && this.$parent.$parent) {
                this.$parent.$parent.highLight(true);
            }
        },
        onDragLeave() {
            console.info("on drag leave");
            this.location = '';
            this.hOver = false;
            if (this.$parent && this.$parent.$parent) {
                this.$parent.$parent.highLight(false);
            }
        },
        highLight(highLight) {
            this.style = highLight ? 'border: solid HighLight 1px' : 'border: solid transparent 1px';
            //this.hightLighted = highLight;
        },
        onDropZoneClicked() {
            if (this.highLighted) {
                ide.setTargetLocation(undefined);
            } else {
                ide.setTargetLocation({
                    cid: this.$parent.cid,
                    key: this.keyInParent,
                    index: this.indexInKey
                });
            }
        }
        // componentBorderStyle: function () {
        //     let style = this.hightLighted ? 'border: solid HighLight 10px !important' : '';
        //     console.info("style " + this.cid, style);
        //     return style;
        //     // return this.edit ? (this.selected ? 'box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19); ' : '')
        //     //     + 'border: ' + (this.targeted ? 'solid orange 1px !important' : this.selected ? 'solid blue 1px !important' : 'dotted lightgray 1px') + ';' : '';
        // }

    }
})
