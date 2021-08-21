Vue.component('events-panel', {
    template: `
        <div v-if="viewModel">
        
            <b-form-select :disabled="selectedEvent.empty && data_model.length === 0" class="mb-2" v-model="rawSelectedEvent" :options="eventOptions" :select-size="4" size="sm"></b-form-select>

            <div class="mb-3">
                 <b-button :disabled="selectedEvent.empty" size="sm" @click="deleteEvent()" class="mr-1">
                    <b-icon-trash></b-icon-trash> delete event
                </b-button>    
                
                <b-button size="sm" @click="addEvent()" class="text-right">
                    <b-icon-plus-circle></b-icon-plus-circle> new event
                </b-button>
               
            </div>

            <!-- selected event -->

            <b-form-group label="Global" label-cols="6" label-size="sm" label-class="mb-0" class="mb-1">
                <b-form-checkbox :disabled="selectedEvent.empty" v-model="selectedEvent.global" switch size="sm" class="mt-1" />
            </b-form-group>
            
            <b-form-group label="Name" label-size="sm" label-class="mb-0" class="mb-1">
                <b-form-input :disabled="selectedEvent.empty" v-if="selectedEvent.global" v-model="selectedEvent.name" :options="selectableEventNames()" size="sm"></b-form-input>
                <b-form-select :disabled="selectedEvent.empty" v-else v-model="selectedEvent.name" :options="selectableEventNames()" size="sm"></b-form-select>
            </b-form-group>

            <b-form-group label="Actions" label-size="sm" label-class="mb-0" class="mb-1">
            </b-form-group>
            
            <b-form-select :disabled="selectedEvent.empty" class="mb-2" v-model="rawSelectedAction" :options="actionOptions" :select-size="4" size="sm"></b-form-select>
            
            <div class="mb-3">
                <b-button :disabled="selectedEvent.empty" size="sm" @click="moveActionUp()" class="mr-1" :enabled="selectedAction && selectedEvent.actions.indexOf(selectedAction) > 0">
                    <b-icon-arrow-up></b-icon-arrow-up>
                </b-button>    

                 <b-button :disabled="selectedEvent.empty" size="sm" @click="moveActionDown()" class="mr-1" :enabled="selectedAction && selectedEvent.actions.indexOf(selectedAction) < selectedEvent.actions.length">
                    <b-icon-arrow-down></b-icon-arrow-down>
                </b-button>    
                 <b-button :disabled="selectedEvent.empty" size="sm" @click="deleteAction()" class="mr-1" :enabled="selectedAction">
                    <b-icon-trash></b-icon-trash>
                </b-button>    
                
                <b-button :disabled="selectedEvent.empty" size="sm" @click="addAction(selectedEvent)" class="text-right">
                    <b-icon-plus-circle></b-icon-plus-circle>
                </b-button>
               
            </div>

            <!-- selected action -->

             <b-form-group label="Description" label-size="sm" label-class="mb-0" class="mb-1">
                <b-form-input :disabled="selectedAction.empty" v-model="selectedAction.description" size="sm"></b-form-input>
            </b-form-group>
       
            <b-form-group label="Target" label-size="sm" label-class="mb-0" class="mb-1">
                <b-input-group v-if="!searchingActionTarget">
                  <b-form-select :disabled="selectedAction.empty" v-model="selectedAction.targetId" :options="selectableComponents()" size="sm"></b-form-select>
                  <b-input-group-append>
                      <b-button :disabled="selectedAction.empty" variant="info" size="sm" @click="searchActionTarget"><b-icon icon="search"></b-icon></b-button>
                  </b-input-group-append>    
                </b-input-group>
                <b-form-input v-if="searchingActionTarget" ref="searchActionTargetInput" placeholder="Type in a target..." v-model="searchActionTargetValue" list="action-target" size="sm" @blur="endSearchActionTarget" @input="checkEndSearchActionTarget"></b-form-input>
                <b-form-datalist id="action-target" :options="selectableComponents()" size="sm"></b-form-datalist>                        
            </b-form-group>

            <b-form-group label="Action" label-size="sm" label-class="mb-0" class="mb-1">
                <b-form-select :disabled="selectedAction.empty" v-model="selectedAction.name" :options="selectableActionNames(selectedAction.targetId)" size="sm"></b-form-select>
            </b-form-group>

            <b-form-group label="Condition" label-size="sm" label-class="mb-0" class="mb-1"
                :eval="evalConditionState()"
                :state="conditionState" 
                :invalid-feedback="conditionInvalidFeedback"
                :valid-feedback="conditionValidFeedback" 
            >
                <b-form-input :disabled="selectedAction.empty" v-model="selectedAction.condition" size="sm"
                    :state="conditionState" @input="evalConditionState()"
                ></b-form-input>
            </b-form-group>

            <b-form-group label="Argument(s)" label-size="sm" label-class="mb-0" class="mb-1"
                :eval="evalArgumentState()"
                :state="argumentState" 
                :invalid-feedback="argumentInvalidFeedback"
                :valid-feedback="argumentValidFeedback" 
            >
                <b-form-textarea :disabled="selectedAction.empty" v-model="selectedAction.argument" size="sm" 
                    :state="argumentState" @input="evalArgumentState()"
                ></b-form-textarea>
            </b-form-group>
        </div>                   
        `,
    props: ['viewModel', 'prop', 'selectedComponentModel'],
    data: () => {
        return {
            data_model: undefined,
            eventOptions: [],
            actionOptions: [],
            rawSelectedEvent: undefined,
            rawSelectedAction: undefined,
            conditionState: undefined,
            conditionInvalidFeedback: undefined,
            conditionValidFeedback: undefined,
            argumentState: undefined,
            argumentInvalidFeedback: undefined,
            argumentValidFeedback: undefined,
            searchingActionTarget: false,
            searchActionTargetValue: undefined
        }
    },
    computed: {
        selectedEvent: {
            get: function() {
                return this.rawSelectedEvent ? this.rawSelectedEvent : { empty: true, actions: [] };
            },
            set: function(e) {
                this.rawSelectedEvent = e;
            }
        },
        selectedAction: {
            get: function() {
                return this.rawSelectedAction ? this.rawSelectedAction : { empty: true };
            },
            set: function(a) {
                this.rawSelectedAction = a;
            }
        }
    },
    mounted: function() {
        this.data_model = this.viewModel;
        this.fillEventOptions();
        if (this.data_model.length > 0) {
            this.selectedEvent = this.data_model[0];
            if (this.selectedEvent.actions.length > 0) {
                this.selectedAction = this.selectedEvent.actions[0];
            }
        }
    },
    watch: {
        data_model: {
            handler: function () {
                if (this.data_model) {
                    this.fillEventOptions();
                    let view = components.getView(this.selectedComponentModel.cid);
                    if (view) {
                        console.info("update event handlers in view");
                        view.$options.methods.unregisterEventHandlers.apply(view);
                        view.$options.methods.registerEventHandlers.apply(view);
                    }
                }
            },
            immediate: true,
            deep: true
        },
        selectedEvent: {
            handler: function() {
                this.fillActionOptions();
            },
            deep: true,
            immediate: true
        },
        viewModel: function() {
            this.data_model = this.viewModel;
            if (this.data_model.length > 0) {
                this.selectedEvent = this.data_model[0];
                if (this.selectedEvent.actions.length > 0) {
                    this.selectedAction = this.selectedEvent.actions[0];
                } else {
                    this.selectedAction = undefined;
                }
            } else {
                this.selectedEvent = undefined;
                this.selectedAction = undefined;
            }
        }
    },
    methods: {
        searchActionTarget() {
            if (!this.selectedAction) {
                return;
            }
            this.searchActionTargetValue = undefined;
            this.searchingActionTarget = true;
            setTimeout(() => this.$refs['searchActionTargetInput'].focus(), 50);
        },
        endSearchActionTarget() {
            if (!this.selectedAction) {
                return;
            }
            if (this.selectableComponents().indexOf(this.searchActionTargetValue) !== -1) {
                this.selectedAction.targetId = this.searchActionTargetValue;
            }
            this.searchingActionTarget = false;
        },
        checkEndSearchActionTarget() {
            if (!this.selectedAction) {
                return;
            }
            if (this.selectableComponents().indexOf(this.searchActionTargetValue) !== -1 && this.selectableComponents().filter(c => c.startsWith(this.searchActionTargetValue)).length === 1) {
                this.endSearchActionTarget();
            }
        },
        addEvent() {
            let event = {
                global: false,
                name: '@click',
                actions: [
                    {
                        targetId: '$self',
                        name: 'eval',
                        description: 'Default action',
                        argument: undefined
                    }
                ]
            };
            this.data_model.push(event);
            setTimeout(() => {
                this.selectedEvent = event;
                this.rawSelectedEvent = this.selectedEvent;
                this.selectedAction = event.actions[0];
                this.rawSelectedAction = this.selectedAction;
            }, 100);
        },
        addAction(event) {
            let action = {
                targetId: this.selectedComponentModel.cid,
                name: 'eval',
                description: 'New action',
                argument: undefined
            };
            event.actions.push(action);
            this.fillActionOptions();
            this.selectedAction = action;
            this.rawSelectedAction = this.selectedAction;
        },
        deleteEvent() {
            const index = this.data_model.indexOf(this.selectedEvent);
            if (index > -1) {
                this.data_model.splice(index, 1);
                this.selectedEvent = undefined;
            }
        },
        deleteAction() {
            const index = this.selectedEvent.actions.indexOf(this.selectedAction);
            if (index > -1) {
                this.selectedEvent.actions.splice(index, 1);
                this.selectedAction = undefined;
                this.fillActionOptions();
            }
        },
        moveActionUp() {
            const index = this.selectedEvent.actions.indexOf(this.selectedAction);
            if (index > 0) {
                Tools.arrayMove(this.selectedEvent.actions, index, index - 1);
                this.fillActionOptions();
            }
        },
        moveActionDown() {
            const index = this.selectedEvent.actions.indexOf(this.selectedAction);
            if (index > -1) {
                Tools.arrayMove(this.selectedEvent.actions, index, index + 1);
                this.fillActionOptions();
            }
        },
        fillEventOptions() {
            if (!this.data_model) {
                this.eventOptions = undefined;
            } else {
                this.eventOptions = this.data_model.map(event => {
                    return {
                        value: event,
                        text: event.name
                    }
                });
            }
        },
        fillActionOptions() {
            if (!this.selectedEvent) {
                this.actionOptions = undefined;
            } else {
                this.actionOptions = this.selectedEvent.actions.map(action => {
                    return {
                        value: action,
                        text: (action.description && action.description !== '' ? '' + action.description + '' : (action.name ? action.name : 'new action'))
                    }
                });
            }
        },
        selectableActionNames(cid) {
            if (cid === '$self' || cid === undefined) {
                cid = this.selectedComponentModel.cid;
            }
            if (cid === '$parent') {
                cid = components.findParent(this.selectedComponentModel.cid);
            }
            if (cid === '$tools') {
                return Object.keys(Tools).sort();
            }
            if (!components.hasComponent(cid)) {
                return [];
            }
            let c = $c(cid);
            if (c) {
                return c.actionNames();
            } else {
                return components.getComponentOptions(cid).methods.actionNames();
            }
        },
        selectableEventNames() {
            let eventNames = editableComponent.methods.eventNames();
            try {
                Array.prototype.push.apply(eventNames, components.getComponentOptions(this.selectedComponentModel.cid).methods.customEventNames());
            } catch (e) {
                // swallow - no component or no method
            }
            return eventNames;
        },
        selectableComponents() {
            return Tools.arrayConcat(['$self', '$parent', '$tools'], Object.keys(components.getComponentModels()).filter(cid => document.getElementById(cid)).sort());
        },
        evalConditionState() {
            if (!this.selectedAction) {
                return;
            }
            let resultData = this.eval(this.selectedAction.condition);
            this.conditionState = resultData.state;
            this.conditionInvalidFeedback = resultData.invalidFeedback;
            this.conditionValidFeedback = resultData.validFeedback;
        },
        evalArgumentState() {
            if (!this.selectedAction) {
                return;
            }
            let resultData = this.eval(this.selectedAction.argument);
            this.argumentState = resultData.state;
            this.argumentInvalidFeedback = resultData.invalidFeedback;
            this.argumentValidFeedback = resultData.validFeedback;
        },
        eval(expression) {
            let resultData = {};
            if (expression == undefined || expression === '') {
                return resultData;
            }
            let __$c = $c;
            try {
                try {
                    let target = { dataModel: [], viewModel: {} };
                    let iteratorIndex = this.iteratorIndex;
                    this.dataModel = [];
                        // inject available actions to target
                    let __c = __$c(this.selectedComponentModel.cid);
                    if (__c) {
                        for (let actionName of __c.actionNames()) {
                            target[actionName] = function() {};
                        }
                    }
                    let value = {};
                    let $d = function() { return []; };
                    let $c = function(cid) {
                        let c = {};
                        // inject available actions to returned component
                        let __c = __$c(this.selectedComponentModel.cid);
                        if (__c) {
                            for (let actionName of __c.actionNames()) {
                                c[actionName] = function() {};
                            }
                        }
                        return c;
                    };
                    let __voidFunction = function() {};
                    let __arrayFunction = function() { return []; };
                    let __stringFunction = function() { return ''; };
                    let $v = function() { return {}; };
                    let alert = __voidFunction;
                    let now = __voidFunction;
                    let date = __voidFunction;
                    let datetime = __voidFunction;
                    let time = __voidFunction;
                    let Tools = {
                        uuid: __stringFunction,
                        truncate: __stringFunction,
                        camelToLabelText: __stringFunction,
                        download: __voidFunction,
                        arrayToCsv: __voidFunction,
                        upload: __voidFunction,
                        csvToArray: __arrayFunction,
                        addToStoredArray: __voidFunction,
                        getStoredArray: __arrayFunction,
                        setStoredArray: __voidFunction,
                        addToStoredArray: __voidFunction,
                        removeFromStoredArray: __voidFunction,
                        range: __arrayFunction,
                        characterRange: __arrayFunction,
                        dateRange: __arrayFunction,
                        diffBusinessDays: __arrayFunction
                    };

                    // let __voidFunction = function() {};
                    // let $v = function() { return {}; };
                    // let alert = __voidFunction;
                    // let now = __voidFunction;
                    // let date = __voidFunction;
                    // let datetime = __voidFunction;
                    // let time = __voidFunction;
                    // let download = __voidFunction;
                    // let arrayToCsv = __voidFunction;
                    // let upload = __voidFunction;
                    // let csvToArray = __voidFunction;

                    let result = eval(expression);
                    resultData.state = true;
                    resultData.validFeedback = 'Valid expression';
                } catch (e) {
                    resultData.state = false;
                    resultData.invalidFeedback = e.message;
                }
                return resultData;
            } catch (e) {
                console.error('error evaluating state', e);
            }
        }
    }
});
