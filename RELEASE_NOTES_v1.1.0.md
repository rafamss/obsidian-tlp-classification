# v1.1.0

## O que mudou

### Nova funcionalidade

**Editor banner agora funciona** (setting `showEditorBanner`)

Uma faixa colorida fina passa a ser desenhada no topo do editor como lembrete
visual da classificação do documento, usando a cor do nível TLP ativo. O toggle
em **Settings → Editor → "Editor banner"** já existia na interface desde a versão
anterior, mas não tinha qualquer implementação por trás — agora tem.

Detalhes do comportamento:

- O banner é desenhado quando se abre um ficheiro, quando o layout do workspace
  fica pronto e sempre que a classificação muda.
- Atualiza imediatamente ao aplicar (`Set TLP classification`) ou remover
  (`Remove TLP classification`) uma classificação.
- Atualiza ao editar manualmente a propriedade TLP no frontmatter.
- Aparece/desaparece de imediato ao ligar/desligar a setting, sem necessidade de
  recarregar o plugin.
- Só é mostrado quando o documento tem um nível TLP válido; documentos sem
  classificação não recebem faixa.

---

### Notas de atualização

Sem breaking changes. As classificações e templates de PDF existentes continuam
a funcionar tal como antes. Recomenda-se recarregar o plugin após atualizar
(Settings → Community Plugins → desativar → ativar, ou reiniciar o Obsidian).

### Limitação conhecida

O toggle **"Require classification for export"** (`requireTlpForExport`) está
presente na interface mas ainda não bloqueia nem avisa durante a exportação —
fica guardado para uma versão futura.

---

**Full Changelog**: https://github.com/rafamss/obsidian-tlp-classification/compare/1.0.1...1.1.0
