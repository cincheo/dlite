Vue.component('dialog-view', {
    extends: editableComponent,
    template: `
         <b-container :id="cid" fluid :style="componentBorderStyle()">
            <component-icon v-if='edit' :type="viewModel.type"></component-icon>
            <component-badge :component="getThis()" :edit="edit" :targeted="targeted" :selected="selected"></component-badge>
            <div v-if="edit">
                <component-view :cid="viewModel.content ? viewModel.content.cid : undefined" keyInParent="content"/>
            </div>
            <b-modal 
                :id="'modal-'+cid" 
                hide-footer
                :class="$eval(viewModel.class, '')"
                :size="viewModel.size"
            >
                <template #modal-title>
                    {{ viewModel.title }}
                </template>
                <component-view :cid="viewModel.content ? viewModel.content.cid : undefined" keyInParent="content"/>
            </b-modal>                
        </b-container>
    `,
    methods: {
        show: function () {
            this.$bvModal.show('modal-'+this.cid);
        },
        hide: function () {
            this.$bvModal.hide('modal-'+this.cid);
        },
        customActionNames() {
            return ["show", "hide"];
        },
        propNames() {
            return ["cid", "dataSource", "class", "title", "content", "size", "eventHandlers"];
        },
        customPropDescriptors() {
            return {
                content: {
                    type: 'ref'
                },
                size: {
                    type: 'select',
                    editable: true,
                    options: ['sm', 'lg', 'xl']
                }
            };
        }
    }
});
