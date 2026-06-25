import {describe, expect, it} from "vitest"
import {
    flowFolderValidationError,
    getFlowFolderPath,
    normalizeFlowFolderPath,
    setFlowFolderInSource,
} from "../../../src/utils/flowFolders"
import {flowYamlUtils as YAML_UTILS} from "@kestra-io/topology"

describe("flowFolders", () => {
    it("normalizes folder paths to at most two levels", () => {
        expect(normalizeFlowFolderPath(" Client / GHL ")).toBe("Client/GHL")
        expect(normalizeFlowFolderPath("Client/GHL/Extra")).toBe("Client/GHL")
        expect(normalizeFlowFolderPath(" / ")).toBeUndefined()
    })

    it("validates unsupported folder paths", () => {
        expect(flowFolderValidationError("Client/GHL")).toBeUndefined()
        expect(flowFolderValidationError("Client/GHL/Extra")).toBe("Flow folders support only two levels.")
    })

    it("reads folder labels from map and list labels", () => {
        expect(getFlowFolderPath({folder: "Client/GHL"})).toBe("Client/GHL")
        expect(getFlowFolderPath([{key: "folder", value: "Client/Clinicorp"}])).toBe("Client/Clinicorp")
    })

    it("sets the folder label without changing id or namespace", () => {
        const source = `id: webhook_router
namespace: promov.integrations
labels:
  client: clinica-a
tasks:
  - id: noop
    type: io.kestra.plugin.core.debug.Return
    format: ok
`

        const updated = setFlowFolderInSource(source, "Clinica A/GHL")
        const parsed = YAML_UTILS.parse(updated)

        expect(parsed.id).toBe("webhook_router")
        expect(parsed.namespace).toBe("promov.integrations")
        expect(parsed.labels.folder).toBe("Clinica A/GHL")
        expect(parsed.labels.client).toBe("clinica-a")
    })
})
