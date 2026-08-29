---
date: "2021-07-20T00:00:00+00:00"
slug: "overview"
sidebar_position: 1
---

# 套件註冊表

從Gitea **1.17**版本開始，套件註冊表可以用作常見套件管理器的公共或私有註冊表。

## 支援的套件管理器

目前支援以下套件管理器：

| Name                                                                | Language   | Package client            |
| ------------------------------------------------------------------- | ---------- | ------------------------- |
| [Alpine](usage/packages/alpine.md)       | -          | `apk`                     |
| [Cargo](usage/packages/cargo.md)         | Rust       | `cargo`                   |
| [Chef](usage/packages/chef.md)           | -          | `knife`                   |
| [Composer](usage/packages/composer.md)   | PHP        | `composer`                |
| [Conan](usage/packages/conan.md)         | C++        | `conan`                   |
| [Conda](usage/packages/conda.md)         | -          | `conda`                   |
| [Container](usage/packages/container.md) | -          | 任何符合OCI規範的客戶端   |
| [CRAN](usage/packages/cran.md)           | R          | -                         |
| [Debian](usage/packages/debian.md)       | -          | `apt`                     |
| [Generic](usage/packages/generic.md)     | -          | 任何HTTP客戶端            |
| [Go](usage/packages/go.md)               | Go         | `go`                      |
| [Helm](usage/packages/helm.md)           | -          | 任何HTTP客戶端, `cm-push` |
| [Maven](usage/packages/maven.md)         | Java       | `mvn`, `gradle`           |
| [npm](usage/packages/npm.md)             | JavaScript | `npm`, `yarn`, `pnpm`     |
| [NuGet](usage/packages/nuget.md)         | .NET       | `nuget`                   |
| [Pub](usage/packages/pub.md)             | Dart       | `dart`, `flutter`         |
| [PyPI](usage/packages/pypi.md)           | Python     | `pip`, `twine`            |
| [RPM](usage/packages/rpm.md)             | -          | `yum`, `dnf`, `zypper`    |
| [RubyGems](usage/packages/rubygems.md)   | Ruby       | `gem`, `Bundler`          |
| [Swift](usage/packages/rubygems.md)      | Swift      | `swift`                   |
| [Vagrant](usage/packages/vagrant.md)     | -          | `vagrant`                 |

**以下段落僅適用於未全域禁用套件的情況！**

## 儲存庫 x 套件

套件始終屬於所有者（使用者或組織），而不是儲存庫。
要將（已上傳的）套件鏈接到儲存庫，請打開該套件的設定頁面，並選擇要將此套件鏈接到的儲存庫。
將鏈接到整個套件，而不僅是單個版本。

鏈接套件將導致在儲存庫的套件列表中顯示該套件，並在套件頁面上顯示到儲存庫的鏈接（以及到儲存庫工單的鏈接）。

## 訪問限制

| 套件所有者類型 | 使用者                                     | 組織                                       |
| ---------------- | ---------------------------------------- | ------------------------------------------ |
| **讀取** 訪問    | 公開，如果使用者也是公開的；否則僅限此使用者 | 公開，如果組織是公開的，否則僅限組織成員   |
| **寫入** 訪問    | 僅套件所有者                           | 具有組織中的管理員或寫入存取權限的組織成員 |

注意：這些訪問限制可能會[變化](https://github.com/go-gitea/gitea/issues/19270)，將通過專門的組織團隊權限添加更細粒度的控制。

## 建立或上傳套件

根據套件類型，使用相應的套件管理器。請查看特定套件管理器的子頁面以獲取說明。

## 查看套件

您可以在儲存庫頁面上查看儲存庫的套件。

1. 轉到儲存庫主頁。
2. 在導航欄中選擇**套件**

要查看有關套件的更多詳細資訊，請選擇套件的名稱。

## 下載套件

要從儲存庫下載套件：

1. 在導航欄中選擇**套件**
2. 選擇套件的名稱以查看詳細資訊。
3. 在 **Assets** 部分，選擇要下載的套件文件的名稱。

## 刪除套件

在將套件發佈到套件註冊表後，您無法編輯套件。相反，您必須刪除並重新建立它。

要從儲存庫中刪除套件：

1. 在導航欄中選擇**套件**
2. 選擇套件的名稱以查看詳細資訊。
3. 單擊**刪除套件**以永久刪除套件。

## 禁用套件註冊表

包註冊表已自動啟用。要在單個儲存庫中禁用它：

1. 在導航欄中選擇**設定**。
2. 禁用**啟用儲存庫套件註冊表**.

禁用套件註冊表不會刪除先前發佈的套件。
