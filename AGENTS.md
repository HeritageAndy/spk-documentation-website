# AGENTS.md

The user who maintains this repository has no programming background. Prefer Chinese for direct operational explanations and final summaries, while keeping all website and repository content in English.

## Working boundary

- The legacy reference website is in the parent folder `C:\Users\Herit\Documents\SPK Documentation`.
- The legacy reference website is read-only.
- Do not modify, move, delete, or commit any legacy-site content.
- All new website code, file changes, and Git operations must stay inside the `spk-documentation-website` repository.

## Content principles

- Do not invent history, dates, architectural research, archaeological conclusions, project information, personal information, or institutional information about Sambor Prei Kuk.
- Unconfirmed content must be marked clearly as Demo, Placeholder, or Content pending.
- Do not independently add unrequested GIS, Cesium, database, search, administration, login, upload, or large-model systems.
- External systems may be represented only through configuration, external links, or iframes unless the user explicitly authorizes a deeper integration.
- Never write access tokens, passwords, or private data into source code.

## Technical principles

- Keep the website simple, stable, and statically deployable.
- Keep editable content in `src/data` or `src/config` where practical so maintainers do not need to edit complex components.
- Update the English README whenever functionality changes.
- Run the build check after changes: `npm.cmd run build`.
- Never hard-code the GitHub repository name in the Pages base path; derive it from the build environment.

## Historical first-stage boundary

The first stage was limited to layout, visual design, navigation, page frameworks, placeholders, and reusable templates. Later functionality requires explicit user authorization. The current CesiumJS and interactive-map work was explicitly authorized after that first stage.
