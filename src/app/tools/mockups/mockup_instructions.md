# Como Adicionar Novos Mockups

Adicionar um novo modelo de celular, tablet ou monitor à ferramenta de Mockups é um processo simples, feito para ser autônomo e não depender de alterações complexas no código.

Siga este passo a passo:

## 1. Prepare seus Arquivos de Imagem

Você precisará de duas imagens para cada novo modelo e elas devem ser salvas na pasta `public/tools/mockups/` do seu projeto Next.js:
- **Mockup** (ex: `2-Mockup.png`): A imagem principal (fundo + dispositivo). Preferencialmente em alta resolução (ex: 1600px de largura).
- **Design Base** (ex: `2-Design.png`): Uma imagem de demonstração (tela/app) que preencha a tela do mockup por padrão antes de o usuário fazer o upload da imagem própria dele.

> [!TIP]
> Não se preocupe em distorcer a imagem do "Design Base" no Photoshop. Salve a tela reta e original! A nossa ferramenta distorce o design sozinha no navegador usando matrizes 3D.

## 2. Adicione no Registro (`mockupsConfig.ts`)

Abra o arquivo `src/lib/mockupsConfig.ts` e adicione um novo objeto na lista `mockupsRegistry`:

```typescript
{
  id: '2', // Um ID único
  name: 'Macbook Pro 16"', // Nome que aparece para o usuário
  imagePath: '/tools/mockups/2-Mockup.png', // Caminho do mockup
  designPath: '/tools/mockups/2-Design.png', // Caminho do design base
  width: 1920, // A largura real da imagem do Mockup
  height: 1080, // A altura real da imagem do Mockup
  targetQuad: { // Deixe valores zerados por enquanto, calibraremos a seguir
    topLeft: { x: 0, y: 0 },
    topRight: { x: 100, y: 0 },
    bottomRight: { x: 100, y: 100 },
    bottomLeft: { x: 0, y: 100 },
  },
  recommendedRatio: '16:10', // Aparece como ajuda para o usuário
}
```

## 3. Calibrando a Perspectiva (Arrastar e Soltar)

A ferramenta possui um modo embutido para descobrir as coordenadas de `targetQuad` sem esforço matemático!

1. Abra a ferramenta no navegador: `http://localhost:3000/tools/mockups`
2. Selecione o seu novo Mockup no carrossel na barra flutuante.
3. Clique no **botão de calibração** (Ícone de Crop / Vetor). O botão ficará **verde**.
4. Você verá 4 bolinhas verdes na tela. **Arraste** cada bolinha para os exatos quatro cantos da tela do dispositivo no seu Mockup.
5. Quando o preview do design estiver perfeitamente alinhado na perspectiva, **clique novamente** no botão de calibração para sair.

> [!IMPORTANT]
> Ao sair do modo calibração, as novas coordenadas serão impressas automaticamente no seu **Console do Navegador (F12)**.

Vá no Console do navegador, copie o bloco `targetQuad` que foi cuspido lá e substitua o bloco zerado que você colocou no arquivo `mockupsConfig.ts`.

## 4. (Opcional) Recortes e Dynamic Island (Máscara SVG)

Se o seu mockup for de um celular com Dynamic Island, Notch, ou você apenas quiser arredondar os cantos com perfeição absoluta, use a propriedade `clipPath`.

- Você pode desenhar a máscara vetorial do tamanho exato da sua imagem `Mockup.png` no Figma ou Illustrator.
- Copie o **SVG Path Data** (a string que começa com `M` e tem várias letras de curvas `C`, `L`, `Z`).
- Adicione na sua configuração:

```typescript
  clipPath: "M741.828 154.79...Z"
```

Pronto! A ferramenta não apenas vai distorcer a tela para a sua perspectiva, como aplicará a máscara vetorial nativamente antes de permitir que o usuário baixe a imagem final.
