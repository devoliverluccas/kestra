import {flowYamlUtils as YAML_UTILS} from "@kestra-io/topology"

export const FLOW_FOLDER_LABEL_KEY = "folder"
export const MAX_FLOW_FOLDER_DEPTH = 2

export interface LabelLike {
    key: string;
    value: string;
}

export interface FlowFolder {
    path: string;
    name: string;
    parent?: string | null;
    depth: number;
    count: number;
}

export function folderPathParts(value?: string | null): string[] {
    if (!value) {
        return []
    }

    return value
        .split("/")
        .map(part => part.trim())
        .filter(Boolean)
}

export function normalizeFlowFolderPath(value?: string | null): string | undefined {
    const parts = folderPathParts(value).slice(0, MAX_FLOW_FOLDER_DEPTH)

    return parts.length ? parts.join("/") : undefined
}

export function flowFolderValidationError(value?: string | null): string | undefined {
    const parts = folderPathParts(value)

    if (parts.length > MAX_FLOW_FOLDER_DEPTH) {
        return "Flow folders support only two levels."
    }

    if (parts.some(part => part.length > 80)) {
        return "Folder names must be 80 characters or fewer."
    }

    return undefined
}

export function labelsToRecord(labels?: LabelLike[] | Record<string, unknown> | null): Record<string, string> {
    if (!labels) {
        return {}
    }

    if (Array.isArray(labels)) {
        return labels.reduce<Record<string, string>>((acc, label) => {
            if (label.key && label.value !== undefined && label.value !== null) {
                acc[label.key] = String(label.value)
            }

            return acc
        }, {})
    }

    return Object.entries(labels).reduce<Record<string, string>>((acc, [key, value]) => {
        if (value !== undefined && value !== null && String(value).length > 0) {
            acc[key] = String(value)
        }

        return acc
    }, {})
}

export function getFlowFolderPath(labels?: LabelLike[] | Record<string, unknown> | null): string | undefined {
    return normalizeFlowFolderPath(labelsToRecord(labels)[FLOW_FOLDER_LABEL_KEY])
}

export function setFlowFolderInSource(source: string, folderPath?: string | null): string {
    const flow = YAML_UTILS.parse(source)
    const labels = labelsToRecord(flow?.labels)
    const normalizedFolderPath = normalizeFlowFolderPath(folderPath)

    if (normalizedFolderPath) {
        labels[FLOW_FOLDER_LABEL_KEY] = normalizedFolderPath
    } else {
        delete labels[FLOW_FOLDER_LABEL_KEY]
    }

    return YAML_UTILS.updateMetadata(source, {
        labels,
    })
}
