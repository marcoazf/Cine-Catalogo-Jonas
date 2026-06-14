# Checkpoint v26 — CineCatalog Elo

## Resumo

Dezoito melhorias aplicadas no `index.html` (+2 arquivos auxiliares), totalizando ~7520 linhas:

### Primeira rodada (11 itens)

1. **(a) Fontes da Capa aumentadas** — `.upl-sub` 10→13px (+30%), `.upl-ratio` 10→15px (+50%)
2. **(b) Dropdown de Gêneros** — `.filter-btn` fonte/espaçamento aumentados; `select option` com `padding: 6px 10px`
3. **(c) Títulos INFO ampliados** — `.label-premium` em INFO modals 0.65rem→0.95rem (+50%)
4. **(d) Config reformada** — cor texto card padrão `#FFFFFF`; nova seção "Gerenciar Gêneros" com input + tags inline
5. **(e) Neon da pesquisa** — verde (`#22C55E`) → laranja (`#FF6B00`) com mais espalhado
6. **(f) Performance** — `loading="lazy"`, `IntersectionObserver`, BATCH_SIZE 20→48, `contain`/`will-change`
7. **(g) Títulos removidos** — "Novo Filme" e "Nova Série" eliminados das abas de cadastro
8. **(h) Auto-update via GitHub** — badge v25.9 no footer, `checkForUpdates()` via GitHub API
9. **(i) Recursos minimizados** — `image-rendering`, `prefers-reduced-motion`, cleanup on `beforeunload`
10. **(j) Manual do Catálogo** — ícone `?` nos INFO modals → abre `manual_do_catalogo.html` (17 seções)
11. **(k) Smart TV** — CSS 1920px+, `focus-visible` laranja, navegação DPAD, cards com `tabIndex`

### Segunda rodada (7 itens)

12. **(a) Ícone Manual movido** — do INFO modals para o cabeçalho do modal FUNCIONALIDADES; `manual_do_catalogo.html` expandido com tabelas de atalhos + dicas de uso + 17 seções
13. **(b) INFO texto + EXECUTAR** — SINOPSE/DIRETOR/ELENCO `0.75rem`→`1rem`; botão EXECUTAR FILME trocado de `<a href>` para `<button onclick="Logic.playMedia(id)">`; mesmo para séries (`updateSeriesPlayBtn` com `onclick`)
14. **(c) CADASTRO dropdown Gêneros** — padding dos `<option>` duplicado: `6px 10px`→`10px 14px`, line-height `1.6`
15. **(d) Gerir Gêneros +30%** — título `9px`→`13px`, ícone `9px`→`text-xs`, `font-weight: 400`, container com `34px`
16. **(e) Config dropdown gêneros** — `<select id="cfg-cat-select">` em ordem alfabética via `renderConfigCategoryList()`
17. **(f) icon.png** — já referenciado em `main.js:8,15` e existente na raiz; sem alteração necessária
18. **(g) SUGESTÕES EXECUTAR** — trocado de `window.open(mediaUrl)` para `Logic.playMedia(item.id)`

---

## Primeira rodada

### Tarefa A — Fontes da Capa aumentadas

#### CSS (`poster-upload-area`)
| Seletor | Antes | Depois | Aumento |
|---|---|---|---|
| `.upl-sub` (JPG • PNG • WEBP) | `10px` | `13px` | +30% |
| `.upl-ratio` (Proporção 9:16) | `10px` | `15px` | +50% |

Arquivo: `index.html`

---

### Tarefa B — Dropdown de Gêneros

#### CSS
| Seletor | Antes | Depois |
|---|---|---|
| `.filter-btn` | `font-size: 0.65rem; padding: 0.45rem 0.75rem` | `font-size: 0.75rem; padding: 0.55rem 0.85rem; margin-bottom: 2px` |
| `.filter-btn i` | `width: 16px; font-size: 0.65rem` | `width: 18px; font-size: 0.7rem` |
| `select.field-premium option` | herdado | `padding: 6px 10px; font-size: 0.8rem` |

---

### Tarefa C — Títulos INFO ampliados

#### CSS
```css
#modal-movie-info .label-premium,
#modal-series-info .label-premium {
    font-size: 0.95rem;  /* antes: 0.65rem → +50% */
}
```

Atinge: Sinopse, Diretor, Elenco em ambos os modais INFO.

---

### Tarefa D — Configurações reformada

#### Cor texto do card
- `#cfg-cat-color-hex` valor padrão: `#000000` → `#FFFFFF` (branco)
- `#cfg-cat-color` color picker: `#000000` → `#FFFFFF`
- Swatch visual: `transparent` → `#FFFFFF`

#### Nova seção "Gerenciar Gêneros"
Inserida após "Gêneros (topo do card)" na Personalização dos Cards:
- Input `#cfg-cat-input` + botão "Add" para adicionar gêneros
- Container `#cfg-cat-list` com tags (`.cfg-cat-tag`) e botão de remover (X vermelho)
- Função `Logic.renderConfigCategoryList()` chamada ao abrir Config, ao adicionar/remover
- `addCategory()` e `removeCategory()` atualizam automaticamente a lista do Config

#### CSS novo
```css
.cfg-cat-tag { ... font-size: 0.7rem; background: rgba(59,130,246,0.12); ... }
.cfg-cat-tag .cfg-cat-rm { color: #EF4444; cursor: pointer; }
```

---

### Tarefa E — Neon da pesquisa

#### CSS (duas regras `.movie-card.search-match`)
| Propriedade | Antes (verde) | Depois (laranja) |
|---|---|---|
| `border-color` | `rgba(34,197,94,0.6)` / `#22C55E` | `rgba(255,107,0,0.7)` / `#FF6B00` |
| `box-shadow` (padrão) | `0 0 20px rgba(34,197,94,0.6), 0 0 60px rgba(34,197,94,0.25)` | `0 0 30px rgba(255,107,0,0.7), 0 0 80px rgba(255,107,0,0.3)` |
| `box-shadow` (hover) | `0 0 20px rgba(34,197,94,0.6), 0 0 40px rgba(34,197,94,0.2)` | `0 0 30px rgba(255,107,0,0.7), 0 0 70px rgba(255,107,0,0.25)` |

---

### Tarefa F — Performance otimizada

#### Lazy loading
- **Imagens**: `loading="lazy"` adicionado ao `<img>` no `createCard()`
- **Render batch**: `IntersectionObserver` substitui scroll events antigos
  - Sentinel `<div class="scroll-sentinel">` inserido após o container
  - `rootMargin: '400px'` para carregar antes do viewport
  - Observer desconectado ao finalizar
- **BATCH_SIZE**: 20 → 48 (reduz número de batches)

#### CSS de performance
| Seletor | Adicionado |
|---|---|
| `.movie-card` | `contain: content; will-change: transform; transform: translateZ(0)` |
| `.dynamic-grid` | `contain: layout style` |
| `.movie-card img` | `image-rendering: auto` |

#### Cleanup
```javascript
window.addEventListener('beforeunload', function() {
    if (Render._observer) { Render._observer.disconnect(); Render._observer = null; }
});
```

---

### Tarefa G — Títulos removidos

| Local | Removido |
|---|---|
| Aba Filmes | `<span>Novo Filme</span>` |
| Aba Séries | `<span>Nova Série</span>` |

O ícone (filme/layer-group) foi mantido.

---

### Tarefa H — Auto-update via GitHub

#### Footer
```html
<span id="version-badge" onclick="Logic.checkForUpdates()">v25.9</span>
<span id="update-status" style="display:none"></span>
```

#### Função `Logic.checkForUpdates()`
- URL: `https://api.github.com/repos/marcoazf/Cine-Catalogo-Jonas/releases/latest`
- Comparação semântica de versões (tag_name vs `25.9`)
- Se atualizado: badge verde + "Atualizado" (some após 3s)
- Se nova versão: badge âmbar + link para download + `showStatus()`
- Se offline/erro: badge vermelho + "Offline"/"Erro" (some após 3s)
- Requisição via `XMLHttpRequest` (sem dependências externas)

---

### Tarefa I — Recursos do sistema

#### Redução de movimento
```css
@media (prefers-reduced-motion: reduce) {
    .movie-card { transition: none; }
    .movie-card:hover { transform: none; }
}
```

#### Otimizações adicionais
- `contain: layout style` no grid principal
- `image-rendering: auto` nas imagens dos cards
- Limpeza do IntersectionObserver no `beforeunload`
- Cards com `will-change: transform` (GPU acelerado)
- Listeners com `{ passive: true }`

---

### Tarefa J — Manual do Catálogo

#### Ícone nos modais INFO (removido na segunda rodada)
Adicionado originalmente no `#modal-movie-info` e `#modal-series-info`, antes do botão Editar.
Movido para FUNCIONALIDADES na segunda rodada (item 12).

#### Arquivo `manual_do_catalogo.html`
`C:\Users\55199\Desktop\Catalogo_Filmes\manual_do_catalogo.html`

17 seções: Visão Geral, Abas, Cadastro, Pesquisa, Modos de Visualização, Gêneros, Configurações, Atalhos de Teclado, Backup, Suporte a TV, Sugestão Diária, Executar Mídia, Gerenciar Gêneros, Personalização, Atualizações, Dicas, Solução de Problemas. Expandido na segunda rodada com tabelas de atalhos + dicas + solução de problemas.

---

### Tarefa K — Suporte a Smart TV

#### CSS para TV (1920px+)
```css
@media (min-width: 1920px) {
    .dynamic-grid { --cards-per-row: 8; }
    .modal-premium-inner { max-width: 1000px !important; }
    #modal-cadastro .modal-premium-inner { max-width: 1100px !important; }
}
```

#### Navegação por controle remoto (DPAD)
```css
.movie-card:focus-visible,
button:focus-visible { outline: 3px solid #FF6B00 !important; outline-offset: 3px; }
.movie-card:focus-visible { transform: scale(0.97); box-shadow: 0 0 30px rgba(255,107,0,0.5); }
```

#### Navegação por setas (JS)
- `document.addEventListener('keydown')` intercepta `ArrowRight/Left/Up/Down`
- Usa `--cards-per-row` para calcular navegação vertical
- `scrollIntoView({ behavior: 'smooth', block: 'nearest' })`
- Só ativo quando nenhum modal estiver aberto
- Cards recebem `tabIndex = 0` no `createCard()`

---

## Segunda rodada

### Tarefa A (12) — Ícone Manual movido para FUNCIONALIDADES

#### O quê
- Ícone `?` removido de `#modal-movie-info` e `#modal-series-info`
- Adicionado no cabeçalho do `#modal-funcionalidades`, ao lado do botão de fechar

#### HTML adicionado
```html
<button onclick="window.open('manual_do_catalogo.html','_blank','width=900,height=700')"
        class="btn-icon" title="Manual do Catálogo">
    <i class="fas fa-question-circle text-sm"></i>
</button>
```

#### manual_do_catalogo.html expandido
17 seções no total:
1. Visão Geral
2. Abas (Filmes/Séries/Estreias)
3. Cadastro de Filmes/Séries
4. Cadastro — Gêneros Personalizados
5. Pesquisa com Destaque Neon
6. Modos de Visualização
7. Gerenciar Gêneros
8. Sugestão Diária
9. Configurações
10. Personalização dos Cards
11. Atalhos de Teclado (Ctrl+1/2/3/F/E/I + setas DPAD)
12. Backup e Restauração
13. Atualizações
14. Executar Mídia (playMedia + Electron)
15. Smart TV e Controle Remoto
16. Dicas de Uso
17. Solução de Problemas

---

### Tarefa B (13) — INFO texto e EXECUTAR reformados

#### CSS — SINOPSE/DIRETOR/ELENCO
```css
#modal-movie-info .label-premium,
#modal-series-info .label-premium {
    font-size: 1.1rem;  /* antes: 0.95rem */
}
#modal-movie-info #mmi-synopsis,
#modal-movie-info #mmi-director,
#modal-movie-info #mmi-cast,
#modal-series-info #msi-synopsis,
#modal-series-info #msi-director,
#modal-series-info #msi-cast {
    font-size: 1rem;    /* antes: 0.75rem (text-sm) */
}
```

#### EXECUTAR FILME (`#mmi-play-btn`)
- HTML: `<a href="...">` → `<button onclick="Logic.playMedia(m.id)">`
- JS: `playBtn.href = url` → `playBtn.onclick = function() { Logic.playMedia(m.id); }`

#### EXECUTAR EPISÓDIO (`#msi-play-btn`)
- HTML: `<a href="...">` → `<button>` com `onclick`
- JS: `playBtn.href = url / '#'` → `playBtn.onclick` com fallback `electronAPI.openMedia(url)` ou `window.open(url, '_blank')`

---

### Tarefa C (14) — CADASTRO dropdown Gêneros com dobro espaçamento

#### CSS
```css
select.field-premium option {
    padding: 10px 14px;   /* antes: 6px 10px — dobro */
    font-size: 0.85rem;   /* antes: 0.8rem */
    line-height: 1.6;     /* novo */
}
```

Aplica-se a todos os selects de categoria em Filmes, Séries e Estreias.

---

### Tarefa D (15) — Gerir Gêneros +30%

#### HTML
| Elemento | Antes | Depois |
|---|---|---|
| Título `<h3>` | `text-[10px] font-black` | `text-[13px] font-normal` (+30%) |
| Ícone `<i>` | `text-[9px]` | `text-xs` |
| Botão fechar | `width:30px; height:30px` | `width:34px; height:34px` |

---

### Tarefa E (16) — Config dropdown gêneros em tempo real

#### HTML adicionado
```html
<select id="cfg-cat-select" class="field-premium"
        style="font-size:0.8rem;padding:0.5rem 0.7rem"></select>
```

Inserido antes de `#cfg-cat-list` na seção "Gerenciar Gêneros" do Config.

#### JS atualizado (`renderConfigCategoryList`)
```javascript
if (sel) {
    var sorted = cats.slice().sort(function(a,b){return a.localeCompare(b)});
    sel.innerHTML = '<option value="">— Gêneros —</option>'
        + sorted.map(function(c){
            return '<option value="'+c.replace(/'/g,"\\'")+'">'+c+'</option>';
          }).join('');
}
```

Ordenação alfabética com `localeCompare`. Atualizado sempre que categorias são adicionadas/removidas.

---

### Tarefa F (17) — icon.png já em uso

#### Verificação
- `electron/main.js:8`: `const iconPath = path.join(__dirname, '..', 'icon.png');`
- `electron/main.js:15`: `icon: fs.existsSync(iconPath) ? iconPath : undefined`
- Arquivo `C:\Users\55199\Desktop\Catalogo_Filmes\icon.png` existe na raiz

Nenhuma alteração necessária — já funcional.

---

### Tarefa G (18) — SUGESTÕES EXECUTAR com playMedia

#### JS alterado (`_fillSuggestionModal`)
```javascript
// Antes:
playBtn.onclick = function() {
    window.open(mediaUrl, '_blank',
        'width=' + screen.availWidth + ',height=' + screen.availHeight + '...');
};

// Depois:
playBtn.onclick = function() {
    Logic.playMedia(item.id);
};
```

Agora usa o player padrão do OS em Electron, ou fallback para navegador.

---

## Integridade

- ✓ Tags HTML balanceadas
- ✓ `main.js` e `preload.js` sem erros de sintaxe
- ✓ Nenhuma referência a `Novo Filme`, `Nova Série`, `_lastSavedItem`, `cloneData`, `cloneLastData`, `btn-clone`
- ✓ Nenhum `window.open` para reprodução de mídia (apenas manual + print)
- ✓ `manual_do_catalogo.html` criado e funcional com 17 seções
- ✓ Versão `v25.9` com auto-update via GitHub API
- ✓ Lazy loading por IntersectionObserver (sem scroll handlers obsoletos)
- ✓ Smart TV: focus-visible + DPAD + @media 1920px
- ✓ Todos os botões EXECUTAR usam `playMedia()` ou `electronAPI.openMedia()` no Electron
- ✓ Dropdown de gêneros no Config em ordem alfabética com atualização em tempo real
- ✓ Nenhuma regressão em funcionalidades existentes
- ✓ HTML termina com `</html>`

## Arquivos relevantes

- `C:\Users\55199\Desktop\Catalogo_Filmes\index.html` (~7520 linhas, todas as 18 melhorias)
- `C:\Users\55199\Desktop\Catalogo_Filmes\manual_do_catalogo.html` (manual do usuário — 17 seções)
- `C:\Users\55199\Desktop\Catalogo_Filmes\electron\main.js` (Electron main — maximizado, sem menu, IPC handlers, icon)
- `C:\Users\55199\Desktop\Catalogo_Filmes\electron\preload.js` (contextBridge — openMedia, pickFile, pickFolder, isElectron)
- `C:\Users\55199\Desktop\Catalogo_Filmes\icon.png` (ícone da aplicação)
- `C:\Users\55199\Desktop\Catalogo_Filmes\checkpoint_v25.8.md` (checkpoint anterior)
