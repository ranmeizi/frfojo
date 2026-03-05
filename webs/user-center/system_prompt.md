请看一下我喂你提供了一些 procomponent 的代码段落，他在 .vscode/koudai.code-snippets 文件夹下。

我对你有几个开发规范要求

1. 一定要写类型 请使用 type.code-snippets 里的代码块单独开一个文件管理api 和 页面中用到的类型
2. table 页需要参照 koudai.code-snippets 文件夹，将所有页面结构相关的代码写到columns.config.ts文件下
3. 变数不多的使用 columns 结构定义页面结构，可变元素较多的请直接使用tsx进行开发，一切以便于修改优先