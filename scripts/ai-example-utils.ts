/** A build-time preview from trusted repository docs plus generated behavior. */
export type ClassicPreviewSource = {
    trustedMarkup: string
    generatedBehavior: string
}

/** Compose the two known inputs directly; do not extract scripts from rendered HTML. */
export function classicSkillBody({ trustedMarkup, generatedBehavior }: ClassicPreviewSource): string {
    const behavior = generatedBehavior.trim()
    if (!behavior) return trustedMarkup.trim()
    return trustedMarkup.trim() + '\n<script>document.addEventListener("DOMContentLoaded", () => {\n' +
        behavior + '\n})</script>'
}

/** Node package exports replace every wildcard in a target with the same subpath. */
export function expandExportPattern(pattern: string, subpath: string): string {
    return pattern.replaceAll('*', () => subpath)
}
