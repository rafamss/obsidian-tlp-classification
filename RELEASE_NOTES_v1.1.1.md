# v1.1.1

Versão de manutenção que endereça as recomendações do review de plugins da
comunidade Obsidian. Sem mudanças de comportamento visível para o utilizador.

## Conformidade e qualidade de código

- **Estilos dinâmicos** deixam de ser atribuídos via `el.style.x = …` e passam
  a usar `setCssStyles()` / classes CSS, conforme a guideline
  `obsidianmd/no-static-styles-assignment`.
- **Compatibilidade com janelas destacadas (pop-out)**: todas as referências a
  `document` passam a usar `activeDocument`, e `setTimeout` passa a
  `window.setTimeout`.
- **Sem `innerHTML`**: o ícone chevron do widget de propriedades passa a ser
  construído com `createSvg()` em vez de injeção de HTML.
- **Comandos** renomeados para não repetir o nome/ID do plugin:
  `set-classification` / `remove-classification`
  (*"Set classification"* / *"Remove classification"*).
- **Tipagem reforçada**: eliminados os acessos `any` inseguros no parsing de
  níveis personalizados, na deteção do Better Export PDF e nas operações de
  frontmatter (`no-unsafe-*`, `no-explicit-any`).
- **Promises** não aguardadas marcadas explicitamente com `void`.
- Removida variável `justifyContent` não utilizada em `header-template.ts`.

## Requisitos

- **`minAppVersion` atualizado de `1.4.0` para `1.4.4`** — a API
  `FileManager.processFrontMatter`, usada para ler/escrever a classificação no
  frontmatter, requer o Obsidian 1.4.4 ou superior.

---

**Full Changelog**: https://github.com/rafamss/obsidian-tlp-classification/compare/1.1.0...1.1.1
