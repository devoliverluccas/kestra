<template>
    <div class="flow-folders" :class="{'is-dragging': dragging}">
        <div class="flow-folders__header">
            <div class="flow-folders__title">
                <FolderOpenOutline />
                <span>Folders</span>
            </div>
        </div>

        <div class="flow-folders__list">
            <button
                class="flow-folder"
                :class="{'is-active': !activeFolder}"
                type="button"
                @click="emit('select')"
                @dragover.prevent="onDragOver"
                @drop="onDrop($event)"
            >
                <FolderOutline />
                <span class="flow-folder__name">All flows</span>
            </button>

            <template v-for="folder in topLevelFolders" :key="folder.path">
                <button
                    class="flow-folder"
                    :class="{'is-active': activeFolder === folder.path}"
                    type="button"
                    @click="emit('select', folder.path)"
                    @dragover.prevent="onDragOver"
                    @drop="onDrop($event, folder.path)"
                >
                    <FolderOutline />
                    <span class="flow-folder__name">{{ folder.name }}</span>
                    <span v-if="folder.count > 0" class="flow-folder__count">{{ folder.count }}</span>
                </button>

                <button
                    v-for="child in childrenByParent[folder.path] ?? []"
                    :key="child.path"
                    class="flow-folder flow-folder--child"
                    :class="{'is-active': activeFolder === child.path}"
                    type="button"
                    @click="emit('select', child.path)"
                    @dragover.prevent="onDragOver"
                    @drop="onDrop($event, child.path)"
                >
                    <SubdirectoryArrowRight />
                    <FolderOutline />
                    <span class="flow-folder__name">{{ child.name }}</span>
                    <span v-if="child.count > 0" class="flow-folder__count">{{ child.count }}</span>
                </button>
            </template>
        </div>
    </div>
</template>

<script setup lang="ts">
    import {computed} from "vue"
    import FolderOpenOutline from "vue-material-design-icons/FolderOpenOutline.vue"
    import FolderOutline from "vue-material-design-icons/FolderOutline.vue"
    import SubdirectoryArrowRight from "vue-material-design-icons/SubdirectoryArrowRight.vue"
    import type {FlowFolder} from "../../utils/flowFolders"

    const props = withDefaults(defineProps<{
        folders?: FlowFolder[];
        activeFolder?: string;
        dragging?: boolean;
        canUpdate?: boolean;
    }>(), {
        folders: () => [],
        activeFolder: undefined,
        dragging: false,
        canUpdate: false,
    })

    const emit = defineEmits<{
        select: [path?: string];
        move: [path?: string];
    }>()

    const topLevelFolders = computed(() => props.folders.filter(folder => folder.depth === 1))

    const childrenByParent = computed(() => props.folders.reduce<Record<string, FlowFolder[]>>((acc, folder) => {
        if (folder.depth === 2 && folder.parent) {
            acc[folder.parent] = acc[folder.parent] ?? []
            acc[folder.parent].push(folder)
        }

        return acc
    }, {}))

    function onDragOver(event: DragEvent) {
        if (!props.canUpdate) {
            return
        }

        if (event.dataTransfer) {
            event.dataTransfer.dropEffect = "move"
        }
    }

    function onDrop(event: DragEvent, path?: string) {
        if (!props.canUpdate) {
            return
        }

        event.preventDefault()
        emit("move", path)
    }
</script>

<style scoped lang="scss">
.flow-folders {
    display: grid;
    gap: var(--ks-spacing-2);
    padding: var(--ks-spacing-3);
    border: 1px solid var(--ks-border-default);
    border-radius: var(--ks-radius-base);
    background: var(--ks-bg-surface);
}

.flow-folders__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-height: 1.75rem;
}

.flow-folders__title {
    display: inline-flex;
    align-items: center;
    gap: var(--ks-spacing-2);
    color: var(--ks-text-primary);
    font-weight: 600;
}

.flow-folders__list {
    display: flex;
    flex-wrap: wrap;
    gap: var(--ks-spacing-2);
}

.flow-folder {
    display: inline-flex;
    align-items: center;
    gap: var(--ks-spacing-1);
    min-height: 2rem;
    max-width: 18rem;
    padding: 0 var(--ks-spacing-2);
    border: 1px solid var(--ks-border-default);
    border-radius: var(--ks-radius-base);
    color: var(--ks-text-primary);
    background: var(--ks-bg-base);
    cursor: pointer;
}

.flow-folder:hover,
.flow-folder.is-active,
.flow-folders.is-dragging .flow-folder:hover {
    border-color: var(--ks-border-active);
    background: var(--ks-bg-hover);
}

.flow-folder--child {
    margin-left: var(--ks-spacing-2);
}

.flow-folder__name {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.flow-folder__count {
    min-width: 1.25rem;
    padding: 0 var(--ks-spacing-1);
    border-radius: 999px;
    color: var(--ks-text-secondary);
    background: var(--ks-bg-active);
    font-size: var(--ks-font-size-xs);
    line-height: 1.25rem;
}
</style>
