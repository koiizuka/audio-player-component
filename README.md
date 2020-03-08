# AudioPlayer

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 9.0.2.

このプロジェクトはVoicy Tech Story Vol.1にて解説されている、音声プレイヤーコンポーネントのコードです。

# Setup

app.component.tsに記載の通り、 `src/assets` ディレクトリを用意し、
そこにあなたの `first.mp3`、 `second.mp3`、 `bgm.mp3`、 `se.mp3` を設置してください。

その後、 `ng serve --host 0.0.0.0` でサーバーを立ち上げると、プレイヤーが表示されます。


# 備考

すまん！間に合わんかった！

が、こちらのコンポーネントは Web Componentsとして埋め込めるようにするし、
HTMLで動的に音声ファイルやBGMを読み込めるようにします！

↓
WebComponent化（Angular Elements化）しました〜〜〜！！

このリポジトリ内で実際にどう動くか確認する場合は
src/test-page/assets/に流したい音声、BGM、SEを置いて、
src/test-page/index.htmlの以下の部分の音声リストを編集して

```js
<script>
    var voices = ['assets/first.mp3', 'assets/first.mp3', 'assets/second.mp3'];
    document.getElementById('v-audio-player').voices = voices;
</script>
```

以下のコマンドを叩くとWebComponentが動いているのを確認できます！！

`npm run build:elements`
`npm -D install http-server`
`npx http-server src/test-page/.`