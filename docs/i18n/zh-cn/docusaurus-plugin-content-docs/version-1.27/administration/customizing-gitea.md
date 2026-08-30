---
date: "2017-04-15T14:56:00+02:00"
slug: "customizing-gitea-v1.27"
sidebar_position: 100

aliases:
  - /zh-cn/customizing-gitea
---

# 自定义 Gitea

自定义 Gitea 通常通过 `CustomPath` 目录完成。默认情况下，它是工作目录（WorkPath）下的
`custom` 目录，但如果您的[安装方式](../installation/from-binary.md)做了不同设置，也可能位于其他位置。
这是覆盖配置项、模板等内容的核心位置。您可以通过 `gitea help` 查看 `CustomPath`，也可以在
_站点管理_ 页面的 _Configuration_ 选项卡中找到该路径。您还可以通过设置 `GITEA_CUSTOM`
环境变量，或在 `gitea` 二进制上使用 `--custom-path` 选项来覆盖 `CustomPath`。
（命令行选项会覆盖环境变量。）

如果 Gitea 以二进制方式部署，所有默认路径都相对于 Gitea 二进制文件。
如果通过发行版安装，这些路径通常会按照 Linux 文件系统标准进行调整。Gitea 会尝试创建所需目录，
包括 `custom/`。某些发行版可能会通过 `/etc/gitea/` 为 `custom` 提供一个符号链接。

应用配置可以在 `CustomConf` 文件中找到，默认路径为 `$GITEA_CUSTOM/conf/app.ini`，
但如果您的[安装方式](../installation/from-binary.md)修改了配置，也可能位于其他位置。
同样，您可以通过 `gitea help` 查看该变量，也可以使用 `gitea` 二进制的 `--config` 选项覆盖它。

- [快速备忘单](../administration/config-cheat-sheet.md)
- [完整配置清单](https://github.com/go-gitea/gitea/blob/main/custom/conf/app.example.ini)

如果在检查 `gitea help` 后仍找不到 `CustomPath` 目录，请检查 `GITEA_CUSTOM` 环境变量；
它可以用来将默认路径覆盖为其他位置。例如，`GITEA_CUSTOM` 可能由 init 脚本设置。
您也可以在站点管理页面的 “Configuration” 选项卡下检查该值是否已设置。

- [环境变量清单](../administration/environment-variables.md)

:::note
Gitea 必须执行完整重启后，配置更改才会生效。
:::

## 提供自定义公共文件

要让 Gitea 提供自定义公共文件（例如页面和图片），请将 `$GITEA_CUSTOM/public/`
目录作为 webroot。Gitea 会跟随符号链接。
当前仅提供以下文件：

- `public/robots.txt`
- `public/.well-known/` 目录中的文件
- `public/assets/` 目录中的文件

例如，存放在 `$GITEA_CUSTOM/public/assets/` 中的 `image.png` 文件，可以通过
`http://gitea.domain.tld/assets/image.png` 访问。

## 修改 Logo

如果要构建自定义 logo 和/或 favicon，请克隆 Gitea 源码仓库，替换 `assets/logo.svg`
和/或 `assets/favicon.svg`，然后运行 `make generate-images`。`assets/favicon.svg`
仅用于 favicon。执行后会更新以下输出文件，随后您可以将它们放到服务器上的
`$GITEA_CUSTOM/public/assets/img` 中：

- `public/assets/img/logo.svg` - 用于站点图标、应用图标
- `public/assets/img/logo.png` - 用于 Open Graph
- `public/assets/img/avatar_default.png` - 用作默认头像图片
- `public/assets/img/apple-touch-icon.png` - 用于 iOS 设备书签
- `public/assets/img/favicon.svg` - 用于 favicon
- `public/assets/img/favicon.png` - 用作不支持 SVG favicon 的浏览器回退图标

如果源图片不是矢量格式，您可以尝试使用诸如[这个工具](https://www.aconvert.com/image/png-to-svg/)
将光栅图像转换为矢量图。

## 自定义 Gitea 页面和资源

Gitea 可执行文件内置了运行所需的全部资源：模板、图片、样式表和翻译。您可以在 `custom`
目录下放置与原路径一致的替换文件来覆盖其中任意资源。例如，要替换 C++ 仓库默认提供的
`.gitignore`，我们需要替换 `options/gitignore/C++`。为此，您必须将替换文件放到
`$GITEA_CUSTOM/options/gitignore/C++`（`CustomPath` 目录位置见本文开头说明）。

Gitea 的每一个页面都可以修改。动态内容通过 [go template](https://pkg.go.dev/html/template)
生成，您可以通过在 `$GITEA_CUSTOM/templates` 目录下放置替换文件进行修改。

要获取任意内嵌文件（包括模板），可以使用[`gitea embedded` 工具](../administration/cmd-embedded.md)。
另外，也可以在 Gitea 源码仓库的 [`templates`](https://github.com/go-gitea/gitea/tree/main/templates)
目录中找到它们。（注意：示例链接指向 `main` 分支，请确保所使用的模板与您当前的发布版本兼容。）

请注意，任何包含在 `{{` 和 `}}` 中的语句都是 Gitea 的模板语法，
如果您没有完全理解这些组件，就不应修改它们。

### 自定义首页 / 主页

将与您所使用 Gitea 版本对应的 [`home.tmpl`](https://github.com/go-gitea/gitea/blob/main/templates/home.tmpl)
从 `templates` 目录复制到 `$GITEA_CUSTOM/templates`。
随后按您的需要编辑即可。
不要忘记重启 Gitea 以应用更改。

### 添加链接和页签

如果您只是想为顶部导航栏或页脚添加额外链接，或者为仓库视图添加额外页签，
可以将它们分别放入 `$GITEA_CUSTOM/templates/custom/` 目录中的
`extra_links.tmpl`（添加到导航栏的链接）、`extra_links_footer.tmpl`
（添加到页脚左侧的链接）和 `extra_tabs.tmpl`。

例如，假设您在德国，需要添加法律上通常要求提供的 “Impressum”/关于页面，用来说明谁对站点内容负责：
只需将该页面放到 `$GITEA_CUSTOM/public/assets/` 目录中
（例如 `$GITEA_CUSTOM/public/assets/impressum.html`），再在
`$GITEA_CUSTOM/templates/custom/extra_links.tmpl` 或
`$GITEA_CUSTOM/templates/custom/extra_links_footer.tmpl` 中加入指向它的链接即可。

为了匹配当前样式，该链接应使用类名 `item`，并且您可以使用 `{{AppSubUrl}}` 获取基础 URL：
`<a class="item" href="{{AppSubUrl}}/assets/impressum.html">Impressum</a>`

更多信息请参见[添加法律页面](../administration/adding-legal-pages.md)。

您也可以用同样的方式添加新页签，将其放入 `extra_tabs.tmpl` 中。
与其他页签样式匹配所需的精确 HTML 位于文件 `templates/repo/header.tmpl`
（[GitHub 源码](https://github.com/go-gitea/gitea/blob/main/templates/repo/header.tmpl)）。

### 页面中的其他插入内容

除了 `extra_links.tmpl` 和 `extra_tabs.tmpl` 之外，您还可以在
`$GITEA_CUSTOM/templates/custom/` 目录中放置其他有用的模板：

- `header.tmpl`，位于 `<head>` 结束标签之前，例如可用于添加自定义 CSS 文件。
- `body_outer_pre.tmpl`，位于 `<body>` 起始标签之后。
- `body_inner_pre.tmpl`，位于顶部导航栏之前，但已处于主容器 `<div class="full height">` 内部。
- `body_inner_post.tmpl`，位于主容器结束之前。
- `body_outer_post.tmpl`，位于底部 `<footer>` 元素之前。
- `footer.tmpl`，位于 `<body>` 结束标签之前，是放置额外 JavaScript 的合适位置。

### 使用 Gitea 变量

您可以在自定义模板中使用各种 Gitea 变量。

首先，_临时_ 启用开发模式：在 `app.ini` 中将 `RUN_MODE = prod` 改为 `RUN_MODE = dev`。
然后在任意模板中添加 `{{ $ | DumpVar }}`，重启 Gitea 并刷新对应页面；
这样会输出所有可用变量。

找到所需数据后，使用对应变量即可；例如，如果您需要仓库名称，可以使用 `{{.Repository.Name}}`。

如果您需要对这些数据做一些转换，而您又不熟悉 Go，一种简单的变通办法是先将数据放入 DOM，
再添加一小段 JavaScript 脚本来处理它。

### 示例：PlantUML

您可以通过 PlantUML 服务器为 Gitea 的 Markdown 添加 [PlantUML](https://plantuml.com/) 支持。
数据会被编码后发送到 PlantUML 服务器，再由服务器生成图片。官方在
http://www.plantuml.com/plantuml 提供了一个在线演示服务器，但如果您（或您的用户）拥有敏感数据，
则可以改为自建一个 [PlantUML 服务器](https://plantuml.com/server)。要启用 PlantUML 渲染，
请从 https://gitea.com/davidsvantesson/plantuml-code-highlight 复制 JavaScript 文件，
并将其放入 `$GITEA_CUSTOM/public/assets/` 目录。然后将以下内容添加到 `$GITEA_CUSTOM/templates/custom/footer.tmpl`：

```html
<script>
  $(async () => {
    if (!$('.language-plantuml').length) return;
    await Promise.all([
      $.getScript('https://your-gitea-server.com/assets/deflate.js'),
      $.getScript('https://your-gitea-server.com/assets/encode.js'),
      $.getScript('https://your-gitea-server.com/assets/plantuml_codeblock_parse.js'),
    ]);
    // Replace call with address to your plantuml server
    parsePlantumlCodeBlocks("https://www.plantuml.com/plantuml");
  });
</script>
```

随后，您就可以在 Markdown 中添加如下代码块：

```plantuml
Alice -> Bob: Authentication Request
Bob --> Alice: Authentication Response

Alice -> Bob: Another authentication Request
Alice <-- Bob: Another authentication Response
```

该脚本会检测 `class="language-plantuml"` 的标签，不过您也可以通过为
`parsePlantumlCodeBlocks` 提供第二个参数来修改这一行为。

### 示例：使用 Online 3D Viewer 预览 CAD 文件

您可以在自己的 Gitea 实例中实现 CAD 文件预览。这个实现使用的是
[`Online 3D Viewer`](https://github.com/kovacsv/Online3DViewer)。

支持以下 3D 文件格式：
`3dm`, `3ds`, `3mf`, `amf`, `bim`, `brep`, `dae`, `fbx`, `fcstd`, `glb`,
`gltf`, `ifc`, `igs`, `iges`, `stp`, `step`, `stl`, `obj`, `off`, `ply`, `wrl`
（`.gltf` 文件仅支持 v2）

#### 第 1 部分：添加模板

我们需要在 `$GITEA_CUSTOM` 中添加模板。
该模板需要保存到 `$GITEA_CUSTOM/templates/custom/` 中。
在这里创建 `footer.tmpl` 文件，并向其中添加以下内容：

```
nano $GITEA_CUSTOM/templates/custom/footer.tmpl
```

```html
<script>
    function onPageChange() {
      // Supported 3D file types
      const fileTypes = ['3dm', '3ds', '3mf', 'amf', 'bim', 'brep', 'dae', 'fbx', 'fcstd', 'glb', 'gltf', 'ifc', 'igs', 'iges', 'stp', 'step', 'stl', 'obj', 'off', 'ply', 'wrl'];
  
      // Select matching link
      const links = Array.from(document.querySelectorAll('a.ui.mini.basic.button'));
      const link3D = links.find(link => {
        const href = link.href.toLowerCase();
        return href.includes('/raw/') && fileTypes.some(ext => href.endsWith(`.${ext}`));
      });
  
	if (link3D) {
	  const existingScript = document.querySelector('script[src="/assets/o3dv/o3dv.min.js"]');

	  const initializeViewer = () => {
		const fileUrl = link3D.getAttribute('href');

                const fileView = document.querySelector('.file-view');

		if (!fileView) return;

		// Remove only the old viewer container if it exists
		const oldView3D = document.getElementById('view-3d');
		if (oldView3D) {
		  oldView3D.remove();  // safely remove old viewer container div
		} else {
		  // No #view-3d, so remove all children inside .file-view
		  while (fileView.firstChild) {
		    fileView.removeChild(fileView.firstChild);
		  }
		}

		// Create a new container for the viewer
		const newView3D = document.createElement('div');
		  newView3D.id = 'view-3d';
		  newView3D.style.padding = '0';
		  newView3D.style.margin = '0';
		  newView3D.style.flexGrow = '1';
		  newView3D.style.minHeight = '0';
		  newView3D.style.width = '100%';
		
		const header = document.querySelector('header');
		const headerHeight = header ? header.offsetHeight : 0;

		newView3D.style.height = `calc(100vh - ${headerHeight}px)`;		

		// Append the new container inside fileView
		fileView.appendChild(newView3D);

		const parentDiv = document.getElementById('view-3d');
		if (parentDiv) {
		  const viewer = new OV.EmbeddedViewer(parentDiv, {
			backgroundColor: new OV.RGBAColor(59, 68, 76, 0),
			defaultColor: new OV.RGBColor(200, 200, 200),
			edgeSettings: new OV.EdgeSettings(false, new OV.RGBColor(0, 0, 0), 1),
			environmentSettings: new OV.EnvironmentSettings([
			  '/assets/o3dv/envmaps/fishermans_bastion/negx.jpg',
			  '/assets/o3dv/envmaps/fishermans_bastion/posx.jpg',
			  '/assets/o3dv/envmaps/fishermans_bastion/posy.jpg',
			  '/assets/o3dv/envmaps/fishermans_bastion/negy.jpg',
			  '/assets/o3dv/envmaps/fishermans_bastion/posz.jpg',
			  '/assets/o3dv/envmaps/fishermans_bastion/negz.jpg'
			], false)
		  });

		  viewer.LoadModelFromUrlList([fileUrl]);
		}
	  };

	  if (typeof OV === 'undefined') {
		if (!existingScript) {
		  const script = document.createElement('script');
		  script.onload = initializeViewer;
		  script.src = '/assets/o3dv/o3dv.min.js';
		  document.head.appendChild(script);
		} else {
		  // Script is loading but OV not yet ready — wait for it
		  existingScript.addEventListener('load', initializeViewer);
		}
	  } else {
		// OV already loaded
		initializeViewer();
	  }
	}
    };

    // Run when the page is fully loaded
    document.addEventListener('DOMContentLoaded', onPageChange); 

    const targetSelector = 'a.ui.mini.basic.button[href*="/raw/"]';
    let lastHref = null;
    let timeoutId = null;

    const checkAndRun = () => {
      const rawLink = document.querySelector(targetSelector);
      if (!rawLink) return;

      const currentHref = rawLink.getAttribute('href');
      if (currentHref !== lastHref) {
        lastHref = currentHref;

        const fileName = currentHref.split('/').pop();
        console.log('New Raw file link detected after delay:', fileName);
        
        onPageChange();
      }
    };

    const observer = new MutationObserver(() => {
      // Delay execution by 300ms after last mutation
      clearTimeout(timeoutId);
      timeoutId = setTimeout(checkAndRun, 300);
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
</script>
```

#### 第 2 部分：添加公共文件

现在我们需要下载最新版本的 O3DV。进入 `$GITEA_CUSTOM/public/assets/`。
使用以下命令创建目录（并进入该目录）：

```
mkdir o3dv
cd o3dv
```

从 [`GitHub`](https://github.com/kovacsv/Online3DViewer/releases) 复制最新发行版压缩包链接
（当前示例版本为 v0.18.0）。
然后使用例如 wget 或 curl 下载该文件：

```
wget https://github.com/kovacsv/Online3DViewer/releases/download/0.18.0/o3dv.zip
```

或者

```
curl -L -O https://github.com/kovacsv/Online3DViewer/releases/download/0.18.0/o3dv.zip
```

再使用例如 unzip 解压归档文件：
```
unzip o3dv.zip
```

#### 第 3 部分：目录权限

最后一步，修改 public 目录权限：
```
chown -R git:git $GITEA_CUSTOM/public
```

现在一切就绪！重启您的 Gitea 实例以应用这些更改，并在浏览器中进行测试。

简单检查一下。最终目录结构应类似如下：

```
$GITEA_CUSTOM/templates
-- custom
    `-- footer.tmpl

$GITEA_CUSTOM/public/assets/
-- o3dv
   |-- o3dv.zip
   |-- o3dv.license.md
   |-- o3dv.min.js
   |-- envmaps
    \...
```

## 自定义 Gitea 邮件

`$GITEA_CUSTOM/templates/mail` 目录允许您修改 Gitea 每一种邮件的正文。
可被覆盖的模板可以在 Gitea 源码的
[`templates/mail`](https://github.com/go-gitea/gitea/tree/main/templates/mail)
目录中找到。
覆盖方式是将对应文件复制到 `$GITEA_CUSTOM/templates/mail` 下，
并保持与源码一致的完整路径结构。

任何包含在 `{{` 和 `}}` 中的语句都是 Gitea 的模板语法，
如果您没有完全理解这些组件，就不应修改它们。

## 为 Gitea 添加统计分析

Google Analytics、Matomo（原 Piwik）以及其他分析服务都可以集成到 Gitea。
要添加跟踪代码，请参考本文的“页面中的其他插入内容”一节，
并将相应 JavaScript 添加到 `$GITEA_CUSTOM/templates/custom/header.tmpl` 文件中。

## 自定义 gitignores、labels、licenses、locales 和 readmes

将自定义文件放入 `custom/options` 下对应的子目录中。

:::note
这些文件不应带有扩展名，例如应使用 `Labels`，而不是 `Labels.txt`
:::

### gitignores

要添加自定义 `.gitignore`，请在 `$GITEA_CUSTOM/options/gitignore` 中添加一个文件，
文件内容遵循现有的 [.gitignore 规则](https://git-scm.com/docs/gitignore)。

## 自定义 git 配置

从 Gitea 1.20 开始，您可以通过 `git.config` 区块自定义 git 配置。

### 启用签名 git push

[签名推送](https://git-scm.com/docs/git-push#Documentation/git-push.txt---signedtruefalseif-asked)
允许客户端对 push 操作本身进行加密签名（而不仅仅是对单个提交签名）。
要启用签名推送，请将以下内容添加到 `app.ini`：

```ini
[git.config]
receive.certNonceSeed = <randomstring>
```

`certNonceSeed` 应设置为一个随机字符串并妥善保密。它用于生成防重放 nonce。
Gitea 默认已经设置了 `receive.advertisePushOptions = true`，因此无需额外配置。
请注意，Gitea 不会读取 `/etc/gitconfig`，因此必须像上面这样通过 `app.ini` 设置该选项。

在客户端侧，可以通过 `git push --signed` 进行签名推送，
或者使用 `git config --global push.gpgSign if-asked` 永久启用。

### Labels

从 Gitea 1.19 开始，您可以向 `$GITEA_CUSTOM/options/label` 中添加一个遵循
[YAML 标签格式](https://github.com/go-gitea/gitea/blob/main/options/label/Advanced.yaml)
的文件：

```yaml
labels:
  - name: "foo/bar"  # 下拉列表中显示的标签名称
    exclusive: true # 是否为作用域标签使用互斥命名空间，作用域分隔符为 /
    color: aabbcc # 十六进制颜色值
    description: Some label # 标签用途的详细描述
 ```

旧的[传统文件格式](https://github.com/go-gitea/gitea/blob/main/options/label/Default)
仍可使用，格式如下，但我们强烈建议改用新的 YAML 格式。

`#hex-color label name ; label description`

更多信息请参阅[标签文档](../usage/issues-prs/labels.md)。

### Licenses

要添加自定义许可证，请将包含许可证文本的文件添加到 `$GITEA_CUSTOM/options/license`。

### Locales

本地化语言由我们的 [Crowdin](https://crowdin.com/project/gitea) 管理。
您可以通过将修改后的语言文件放到 `$GITEA_CUSTOM/options/locale` 中来覆盖某个语言环境。
Gitea 默认的语言文件可以在源码目录
[`options/locale`](https://github.com/go-gitea/gitea/tree/main/options/locale) 中找到，
这些文件可以作为您修改时的参考示例。

如果要添加一个全新的语言环境，除了将文件放到上述位置外，
您还需要在 `app.ini` 的 `[i18n]` 部分中添加新的语言代码和名称。
请记住，Gitea 会将这些设置视为**覆盖项**，因此如果您还想保留其他语言，
就需要复制默认值并在其中加入您自己的语言项。

```ini title="app.ini"
[i18n]
LANGS = en-US,foo-BAR
NAMES = English,FooBar
```

如果用户浏览器的语言与列表中的任何语言都不匹配，则第一种语言会被用作默认语言。

不同版本之间的语言文件可能会变化，因此强烈建议持续跟踪您自定义过的语言文件。

### Readmes

要添加自定义 Readme，请将一个 Markdown 格式的文件（不带 `.md` 扩展名）
放到 `$GITEA_CUSTOM/options/readme` 中。

:::note
Readme 模板支持**变量展开**。
当前可用变量包括 `{Name}`（仓库名称）、`{Description}`、`{CloneURL.SSH}`、`{CloneURL.HTTPS}` 和 `{OwnerName}`
:::

### Reactions

要修改反应表情，您可以在 `app.ini` 中设置允许使用的 reactions。

```ini title="app.ini"
[ui]
REACTIONS = +1, -1, laugh, confused, heart, hooray, eyes
```

完整的受支持 emoji 列表见 [emoji list](https://gitea.com/gitea/gitea.com/issues/8)。

## 自定义 Gitea 外观

内置主题有 `gitea-light`、`gitea-dark` 和 `gitea-auto`
（会自动适应操作系统设置）。

默认主题可以通过 `app.ini` 中 [ui](../administration/config-cheat-sheet.md#界面) 部分的
`DEFAULT_THEME` 进行修改。

Gitea 还支持用户主题，这意味着每位用户都可以选择要使用的主题。
用户可选主题列表可以通过 `app.ini` 中 [ui](../administration/config-cheat-sheet.md#界面)
部分的 `THEMES` 值进行配置。

要让所有用户都能使用自定义主题：

1. 将 CSS 文件添加到 `$GITEA_CUSTOM/public/assets/css/theme-<theme-name>.css`。
   您可以通过执行 `gitea help` 并查看其中的 “CustomPath” 值来确认实例的 `$GITEA_CUSTOM`。
2. 将 `<theme-name>` 添加到 `app.ini` 中 `THEMES` 设置的逗号分隔列表中，
   或者将 `THEMES` 留空以允许所有主题。

名为 `theme-my-theme.css` 的自定义主题文件会在用户主题选择页面中显示为 `my-theme`。
您还可以在自定义主题 CSS 文件中加入主题元信息，以提供更多说明。
如果自定义主题是暗色主题，请在 `:root` 块中设置全局 CSS 变量 `--is-dark-theme: true`。
这样 Gitea 就可以相应地调整 Monaco 代码编辑器的主题。
如果要实现 “auto” 主题，可以参考 `theme-gitea-auto.css`。

```css
gitea-theme-meta-info {
  --theme-display-name: "My Awesome Theme"; /* this theme will be display as "My Awesome Theme" on the UI */
}
:root {
  --is-dark-theme: true; /* if it is a dark theme */
  --color-primary: #112233;
  /* more custom theme variables ... */
}
```

社区主题列在 [gitea/awesome-gitea#themes](https://gitea.com/gitea/awesome-gitea#themes)。

默认主题源码可在[这里](https://github.com/go-gitea/gitea/blob/main/web_src/css/themes)找到。

## 自定义字体

可以使用 CSS 变量自定义字体：

```css
:root {
  --fonts-proportional: /* custom proportional fonts */ !important;
  --fonts-monospace: /* custom monospace fonts */ !important;
  --fonts-emoji: /* custom emoji fonts */ !important;
}
```
