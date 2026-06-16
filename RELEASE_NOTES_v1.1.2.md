# v1.1.2

Versão de manutenção. Sem mudanças de comportamento visível para o utilizador.

## Correções

- **CSS sem `!important`**: a regra que esconde o input nativo do painel de
  propriedades (substituído pelo nosso widget de badge) deixa de usar
  `!important` e passa a vencer por especificidade
  (`.metadata-property-value .tlp-native-hidden`).

## Publicação

- Este release é construído e publicado pelo workflow de CI
  (`.github/workflows/release.yml`), que gera **artifact attestations**
  (`actions/attest-build-provenance`) para `main.js` e `styles.css`,
  permitindo verificar criptograficamente a proveniência dos assets.

---

**Full Changelog**: https://github.com/rafamss/obsidian-tlp-classification/compare/1.1.1...1.1.2
