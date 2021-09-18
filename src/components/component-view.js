Vue.component('component-view', {
    template: `
        <div v-if="viewModel" :id="'cc-'+viewModel.cid" :ref="viewModel.cid" 
            :class="layoutClass()"
            :style="layoutStyle()"
            @mouseup="onResizeCandidate"
        >
            <a v-if="generateAnchor()" :id="viewModel.publicName" :ref="viewModel.publicName" :style="anchorStyle()"></a>
            <b-icon v-if="edit && generateAnchor()" icon="geo-alt-fill" width="1rem" height="1rem" class="float-left" v-b-popover.hover="'#' + viewModel.publicName" variant="danger"></b-icon>
            <b-popover v-if="edit" :ref="'popover-'+viewModel.cid" :target="viewModel.cid" custom-class="p-0"
                placement="top" 
                triggers="manual" 
                :fallback-placement="[]"
                :noninteractive="true"
                boundary="window"
                boundary-padding="0"
                >
                <b-icon :icon="selected ? 'unlock' : 'lock'" class="mr-2" :variant="selected ? 'success' : 'danger'" size="lg"></b-icon>
                <component-icon :type="viewModel.type" class="mr-2" size="sm"></component-icon>{{ viewModel.cid }}
                <span v-if="generateAnchor()">
                    <b-icon icon="geo-alt-fill" variant="danger"></b-icon>&nbsp;#{{viewModel.publicName}}
                </span>
            </b-popover>           
            <div v-if="edit && locked === undefined && !isRoot() && isVisible()"
                @click="onDropZoneClicked"
                ref="drop-zone"
                :class="dropZoneClass()"
                @drop="onDrop"
                @mouseover="onDragEnter"
                @mouseleave="onDragLeave"
                @dragenter="onDragEnter"
                @dragleave="onDragLeave"
                @dragover.prevent
                @dragenter.prevent
            >
                <b-button v-if="highLighted" size="sm" variant="link" @click="createComponentModal"><b-icon icon="plus-circle"></b-icon></b-button>
<!--                <span v-if="viewModel.type === 'Undefined'" style="pointer-events: none; font-style: italic">[add component here]</span>-->
            </div>
            <collection-view ref="component" :cid="viewModel.cid" v-if="viewModel.type == 'CollectionView'" :iteratorIndex="iteratorIndex" :inSelection="inSelection">
            </collection-view>
            
            <instance-view ref="component" :cid="viewModel.cid" v-if="viewModel.type == 'InstanceView'" :iteratorIndex="iteratorIndex" :inSelection="inSelection">
            </instance-view>

            <table-view ref="component" :cid="viewModel.cid" v-if="viewModel.type == 'TableView'" :iteratorIndex="iteratorIndex" :inSelection="inSelection">
            </table-view>

             <split-view ref="component" :cid="viewModel.cid" v-if="viewModel.type == 'SplitView'" :iteratorIndex="iteratorIndex" :inSelection="inSelection">
             </split-view>
             
             <navbar-view ref="component" :cid="viewModel.cid" v-if="viewModel.type == 'NavbarView'" :iteratorIndex="iteratorIndex" :inSelection="inSelection">
             </navbar-view>

             <dialog-view ref="component" :cid="viewModel.cid" v-if="viewModel.type == 'DialogView'" :iteratorIndex="iteratorIndex" :inSelection="inSelection">
             </dialog-view>

             <popover-view ref="component" :cid="viewModel.cid" v-if="viewModel.type == 'PopoverView'" :iteratorIndex="iteratorIndex" :inSelection="inSelection">
             </popover-view>
             
             <container-view ref="component" :cid="viewModel.cid" v-if="viewModel.type == 'ContainerView'" :iteratorIndex="iteratorIndex" :inSelection="inSelection">
             </container-view>

             <collection-provider ref="component" :cid="viewModel.cid" v-if="viewModel.type == 'CollectionProvider'" :iteratorIndex="iteratorIndex" :inSelection="inSelection">
             </collection-provider>

             <instance-provider ref="component" :cid="viewModel.cid" v-if="viewModel.type == 'InstanceProvider'" :iteratorIndex="iteratorIndex" :inSelection="inSelection">
             </instance-provider>

             <input-view ref="component" :cid="viewModel.cid" v-if="viewModel.type == 'InputView'" :iteratorIndex="iteratorIndex" :inSelection="inSelection">
             </input-view>

             <button-view ref="component" :cid="viewModel.cid" v-if="viewModel.type == 'ButtonView'" :iteratorIndex="iteratorIndex" :inSelection="inSelection">
             </button-view>

             <checkbox-view ref="component" :cid="viewModel.cid" v-if="viewModel.type == 'CheckboxView'" :iteratorIndex="iteratorIndex" :inSelection="inSelection">
             </checkbox-view>

             <select-view ref="component" :cid="viewModel.cid" v-if="viewModel.type == 'SelectView'" :iteratorIndex="iteratorIndex" :inSelection="inSelection">
             </select-view>

             <card-view ref="component" :cid="viewModel.cid" v-if="viewModel.type == 'CardView'" :iteratorIndex="iteratorIndex" :inSelection="inSelection">
             </card-view>

             <image-view ref="component" :cid="viewModel.cid" v-if="viewModel.type == 'ImageView'" :iteratorIndex="iteratorIndex" :inSelection="inSelection">
             </image-view>

             <chart-view ref="component" :cid="viewModel.cid" v-if="viewModel.type == 'ChartView'" :iteratorIndex="iteratorIndex" :inSelection="inSelection">
             </chart-view>

             <time-series-chart-view ref="component" :cid="viewModel.cid" v-if="viewModel.type == 'TimeSeriesChartView'" :iteratorIndex="iteratorIndex" :inSelection="inSelection">
             </time-series-chart-view>

             <application-connector ref="component" :cid="viewModel.cid" v-if="viewModel.type == 'ApplicationConnector'" :iteratorIndex="iteratorIndex" :inSelection="inSelection">
             </application-connector>

             <http-connector ref="component" :cid="viewModel.cid" v-if="viewModel.type == 'HttpConnector'" :iteratorIndex="iteratorIndex" :inSelection="inSelection">
             </http-connector>
            
             <cookie-connector ref="component" :cid="viewModel.cid" v-if="viewModel.type == 'CookieConnector'" :iteratorIndex="iteratorIndex" :inSelection="inSelection">
             </cookie-connector>

             <local-storage-connector ref="component" :cid="viewModel.cid" v-if="viewModel.type == 'LocalStorageConnector'" :iteratorIndex="iteratorIndex">
             </local-storage-connector>
            
             <data-mapper ref="component" :cid="viewModel.cid" v-if="viewModel.type == 'DataMapper'" :iteratorIndex="iteratorIndex" :inSelection="inSelection">
             </data-mapper>

             <iterator-view ref="component" :cid="viewModel.cid" v-if="viewModel.type == 'IteratorView'" :iteratorIndex="iteratorIndex" :inSelection="inSelection">
             </iterator-view>

             <text-view ref="component" :cid="viewModel.cid" v-if="viewModel.type == 'TextView'" :iteratorIndex="iteratorIndex" :inSelection="inSelection">
             </text-view>

             <datepicker-view ref="component" :cid="viewModel.cid" v-if="viewModel.type == 'DatepickerView'" :iteratorIndex="iteratorIndex" :inSelection="inSelection">
             </datepicker-view>

             <timepicker-view ref="component" :cid="viewModel.cid" v-if="viewModel.type == 'TimepickerView'" :iteratorIndex="iteratorIndex" :inSelection="inSelection">
             </timepicker-view>

             <icon-view ref="component" :cid="viewModel.cid" v-if="viewModel.type == 'IconView'" :iteratorIndex="iteratorIndex" :inSelection="inSelection">
             </icon-view>

             <pagination-view ref="component" :cid="viewModel.cid" v-if="viewModel.type == 'PaginationView'" :iteratorIndex="iteratorIndex" :inSelection="inSelection">
             </pagination-view>

             <pdf-view ref="component" :cid="viewModel.cid" v-if="viewModel.type == 'PdfView'" :iteratorIndex="iteratorIndex" :inSelection="inSelection">
             </pdf-view>

             <embed-view ref="component" :cid="viewModel.cid" v-if="viewModel.type == 'EmbedView'" :iteratorIndex="iteratorIndex" :inSelection="inSelection">
             </embed-view>

             <carousel-view ref="component" :cid="viewModel.cid" v-if="viewModel.type == 'CarouselView'" :iteratorIndex="iteratorIndex" :inSelection="inSelection">
             </carousel-view>

             <b-alert v-if="viewModel.type === null" show variant="danger">Undefined component type</b-alert>
             
        </div>
        <div v-else>
            <div v-if="edit && locked === undefined">
                <div :class="dropZoneClass()" 
                    @drop="onDrop($event)"
                    @click="onDropZoneClicked"
                    @mouseover="onDragEnter"
                    @mouseleave="onDragLeave"
                    @dragenter="onDragEnter"
                    @dragleave="onDragLeave"
                    @dragover.prevent
                    @dragenter.prevent
                    >
                    <b-button v-if="highLighted" size="sm" variant="link" @click="createComponentModal"><b-icon icon="plus-circle"></b-icon></b-button>
                    <span style="pointer-events: none; font-style: italic; font-size: small">[add component here]</span>
                </div>
            </div>
            <b-alert v-else show variant="warning">{{ locked ? locked : 'Requested component does not exist.' }}</b-alert>
        </div>       
    `,
    props: ['cid', 'keyInParent', 'indexInKey', 'locked', 'iteratorIndex', "inSelection"],
    data: function () {
        return {
            viewModel: undefined,
            edit: ide.editMode,
            hOver: false,
            highLighted: false,
            hovered: false,
            selected: false,
            style: 'border: dotted lightgrey 1px; max-width: 100%',
            location: '',
            animation: undefined,
            animateDuration: undefined,
            hiddenBeforeAnimate: false
        }
    },
    watch: {
        cid: function (cid) {
            this.updateViewModel();
        },
        hovered: {
            handler: function (value) {
                if (!this.viewModel) {
                    return;
                }
                let popover = 'popover-' + this.cid;
                if (this.hovered) {
                    ide.updateHoverOverlay(this.cid);
                    if (!this.selected) {
                        ide.showHoverOverlay();
                    }
                    if (this.$refs[popover] && !this.isEditable()) {
                        this.$refs[popover].$emit('open');
                    }
                } else {
                    if (this.$refs[popover] && !this.selected) {
                        if (!this.isEditable()) {
                            this.$refs[popover].$emit('close');
                        }
                    }
                }
            },
            immediate: true
        },
        selected: {
            handler: function () {
                if (!this.viewModel) {
                    return;
                }
                let popover = 'popover-' + this.cid;
                if (this.selected) {
                    if (!this.isEditable()) {
                        //this.$refs[popover].$emit('close');
                    }
                    ide.updateSelectionOverlay(this.cid);
                    ide.showSelectionOverlay();
                } else {
                    if (this.$refs[popover]) {
                        this.$refs[popover].$emit('close');
                    }
                }
            },
            immediate: true
        }
    },
    created: function () {
        this.$eventHub.$on('edit', (edit) => {
            this.edit = edit;
            if (!this.edit) {
                let popover = 'popover-' + this.cid;
                if (this.$refs[popover]) {
                    this.$refs[popover].$emit('close');
                }
            } else {
                if (this.selected) {
                    ide.updateSelectionOverlay(this.cid);
                    ide.showSelectionOverlay();
                    let popover = 'popover-' + this.cid;
                    if (this.$refs[popover]) {
                        this.$refs[popover].$emit('open');
                    }
                }
            }
        });
        this.$eventHub.$on('target-location-selected', (location) => {
            this.hOver = false;
            if (!location) {
                this.highLighted = false;
            } else {
                this.highLighted = (location.cid === this.$parent.cid && location.key === this.keyInParent && location.index === this.indexInKey);
            }
        });
        this.$eventHub.$on('component-updated', (cid) => {
            if (this.viewModel && cid === this.viewModel.cid) {
                this.viewModel = components.getComponentModel(cid);
            }
        });
        this.$eventHub.$on('component-hovered', (cid, hovered) => {
            this.hovered = (cid && (cid === this.cid)) && hovered;
        });
        this.$eventHub.$on('component-selected', (cid) => {
            this.selected = cid && (cid === this.cid);
        });
    },
    mounted: function () {
        this.updateViewModel();
        if (this.viewModel.observeIntersections && this.viewModel.revealAnimation) {
            console.info("hidden", this.viewModel.cid);
            this.hiddenBeforeAnimate = true;
        }
        this.rect = this.$el.getBoundingClientRect();
    },
    updated: function () {
        if (this.viewModel && this.viewModel.cid) {
            ide.updateHoverOverlay(ide.hoveredComponentId);
            ide.updateSelectionOverlay(ide.selectedComponentId);
        }
    },
    methods: {
        generateAnchor() {
            return this.viewModel.publicName && components.isVisibleComponent(this.viewModel);
        },
        anchorStyle() {
            if (applicationModel.navbar.fixed = 'top') {
                // const navBar = document.getElementById('navbar');
                // let height = navBar ? navBar.offsetHeight : 0;
                // console.info("ANCHOR", height)
                return `position: relative; top: -3rem`;
            } else {
                return '';
            }
        },
        onResizeCandidate(event) {
            let resizeDirections = undefined;
            if (this.viewModel.resizeDirections && (resizeDirections = this.$eval(this.viewModel.resizeDirections, 'none')) !== 'none') {
                let rect = this.$el.getBoundingClientRect();
                if (!(this.rect.width === rect.width && this.rect.height === rect.height)) {
                    console.info("ON RESZiZE", event);
                    this.rect = rect;
                    if (this.$refs['component']) {
                        this.$refs['component'].$emit('@resize', rect);
                    }
                }
            }
        },
        layoutStyle() {
            let style = this.isEditable() ? this.style : '';
            style += ';';
            style += this.$eval(this.viewModel.layoutStyle, '');
            let directions = this.$eval(this.viewModel.resizeDirections, 'none');
            if (directions && directions !== 'none') {
                style += "; resize: " + directions + '; overflow: auto';
            }
            if (this.animation) {
                if (this.animateDuration) {
                    style += `; --animate-duration: ${this.animateDuration}ms`;
                }
            }
            return style;
        },
        layoutClass() {
            let layoutClass = 'component-container'
                + (this.viewModel.layoutClass ? ' ' + this.$eval(this.viewModel.layoutClass, '') : '')
                + (this.$eval(this.viewModel.hidden, false) ? (this.edit ? ' opacity-40' : ' d-none') : '');
            if (this.animation) {
                layoutClass += ' animate__animated animate__' + this.animation;
            }
            if (this.hiddenBeforeAnimate) {
                layoutClass += ' opacity-1';
            }
            return layoutClass;
        },
        isVisible() {
            if (this.viewModel && this.viewModel.cid) {
                switch (this.viewModel.type) {
                    case 'ApplicationConnector':
                    case 'CookieConnector':
                    case 'DataMapper':
                    case 'LocalStorageConnector':
                        return false;
                    default:
                        return true;
                }
            } else {
                return false;
            }
        },
        isRoot() {
            if (this.viewModel && this.viewModel.cid) {
                return components.getRoots().map(c => c.cid).indexOf(this.viewModel.cid) > -1;
            } else {
                return true;
            }
        },
        // isEditable() {
        //     return this.edit && this.inSelection;
        // },
        isEditable() {
            return this.edit && (this.targeted || this.inSelection);
        },
        createComponentModal: function (e) {
            e.stopPropagation();
            // ide.setTargetLocation({
            //     cid: this.$parent.cid,
            //     key: this.keyInParent,
            //     index: this.indexInKey
            // });
            // this.highLighted = true;
            this.$root.$emit('bv::show::modal', 'create-component-modal');
            //this.$eventHub.$emit('component-selected', this.component.cid);
        },
        dropZoneClass() {
            return this.hOver || this.highLighted ? 'active-drop-zone' : 'drop-zone';
        },
        showBuilder(id) {
            ide.setTargetLocation({
                cid: this.$parent.cid,
                key: this.keyInParent,
                index: this.indexInKey
            });
            console.info("showbuilder", id);
            this.$bvModal.show(id);
        },
        createComponent(type) {
            console.info("createComponent", type, this.keyInParent, this.$parent.cid);
            const viewModel = components.createComponentModel(type);
            components.registerComponentModel(viewModel);
            components.setChild({
                cid: this.$parent.cid,
                key: this.keyInParent,
                index: this.indexInKey
            }, viewModel);
            ide.selectComponent(viewModel.cid);
        },
        setComponent(cid) {
            const containerView = components.getContainerView(cid);
            if (containerView) {
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
        updateViewModel() {
            // if (this.viewModel && this.viewModel.cid === this.cid) {
            //     return;
            // }
            this.viewModel = components.getComponentModel(this.cid);
            // if (this.viewModel && this.viewModel.revealAnimation && this.viewModel.revealAnimation != '') {
            //     console.info('observe intersections', this.cid);
            //     this.$intersectionObserver.observe(this.$el);
            // } else {
            //     console.info('unobserve intersections', this.cid);
            //     this.$intersectionObserver.unobserve(this.$el);
            // }
            // if (this.viewModel.publicName) {
            //     this.$intersectionObserver.observe();
            // }
        },
        onDrop(evt) {
            console.info("ON DROP", evt);
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
            ide.updateHoverOverlay(ide.hoveredComponentId);
            ide.updateSelectionOverlay(ide.selectedComponentId);

        },
        onDragEnter() {
            this.location = this.$parent.cid + '.' + this.keyInParent + (typeof this.indexInKey === 'number' ? '[' + this.indexInKey + ']' : '');
            this.hOver = true;
            if (this.$parent && this.$parent.$parent) {
                try {
                    this.$parent.$parent.highLight(true);
                } catch (e) {
                }
            }
        },
        onDragLeave() {
            this.location = '';
            this.hOver = false;
            if (this.$parent && this.$parent.$parent) {
                try {
                    this.$parent.$parent.highLight(false);
                } catch (e) {
                }
            }
        },
        highLight(highLight) {
            this.style = highLight ? 'border: solid HighLight 1px' : 'border: solid transparent 1px';
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
        },
        $eval(expression, defaultValue) {
            if (!this.$refs['component']) {
                return defaultValue;
            }
            try {
                return this.$refs['component'].$eval(expression, defaultValue);
            } catch (e) {
                console.error('error evaluating', expression, this);
                return defaultValue;
            }
        },
        getComponent() {
            return this.$refs['component'];
        },
        animate(animation, duration, delay) {
            if (typeof duration === 'string') {
                duration = parseInt(duration);
                if (isNaN(duration)) {
                    duration = 1000;
                }
            }
            if (typeof delay === 'string') {
                delay = parseInt(delay);
                if (isNaN(delay)) {
                    delay = 0;
                }
            }
            console.info('animate', this.cid, animation, duration, delay);
            duration = duration !== undefined ? duration : 1000;
            delay = delay !== undefined ? delay : 0;

            setTimeout(() => {
                this.hiddenBeforeAnimate = false;
                this.animation = animation;
                this.animateDuration = duration;
                setTimeout(() => {
                    this.animation = undefined;
                    this.animateDuration = undefined;
                    this.animateDelay = undefined;
                }, duration + 10);
            }, delay)

        },

    }
})
