---
date: "2021-07-20T00:00:00+00:00"

slug: "maven"
sidebar_position: 60

---

# Maven 套件註冊表

為您的使用者或組織發佈 [Maven](https://maven.apache.org) 套件。

## 要求

要使用 Maven 套件註冊表，您可以使用 [Maven](https://maven.apache.org/install.html) 或 [Gradle](https://gradle.org/install/)。
以下範例使用 `Maven` 和 `Gradle Groovy`。

## 設定套件註冊表

要註冊套件註冊表，首先需要將存取權杖添加到 [`settings.xml`](https://maven.apache.org/settings.html) 文件中：

```xml
<settings>
  <servers>
    <server>
      <id>gitea</id>
      <configuration>
        <httpHeaders>
          <property>
            <name>Authorization</name>
            <value>token {access_token}</value>
          </property>
        </httpHeaders>
      </configuration>
    </server>
  </servers>
</settings>
```

然後在專案的 `pom.xml` 文件中添加以下部分：

```xml
<repositories>
  <repository>
    <id>gitea</id>
    <url>https://gitea.example.com/api/packages/{owner}/maven</url>
  </repository>
</repositories>
<distributionManagement>
  <repository>
    <id>gitea</id>
    <url>https://gitea.example.com/api/packages/{owner}/maven</url>
  </repository>
  <snapshotRepository>
    <id>gitea</id>
    <url>https://gitea.example.com/api/packages/{owner}/maven</url>
  </snapshotRepository>
</distributionManagement>
```

| 參數           | 描述                                                                                  |
| -------------- | ------------------------------------------------------------------------------------- |
| `access_token` | 您的[個人存取權杖](development/api-usage.md#透過-api-認證) |
| `owner`        | 套件的所有者                                                                        |

### Gradle variant

如果您計劃在專案中添加來自 Gitea 實例的一些套件，請將其添加到 repositories 部分中：

```groovy
repositories {
    // other repositories
    maven { url "https://gitea.example.com/api/packages/{owner}/maven" }
}
```

在 Groovy gradle 中，您可以在發佈部分中包含以下腳本：

```groovy
publishing {
    // 其他發佈設置
    repositories {
        maven {
            name = "Gitea"
            url = uri("https://gitea.example.com/api/packages/{owner}/maven")

            credentials(HttpHeaderCredentials) {
                name = "Authorization"
                value = "token {access_token}"
            }

            authentication {
                header(HttpHeaderAuthentication)
            }
        }
    }
}
```

## 發佈套件

要發佈套件，只需運行以下命令：

```shell
mvn deploy
```

或者，如果您使用的是 Gradle，請使用 `gradle` 命令和 `publishAllPublicationsToGiteaRepository` 任務：

```groovy
./gradlew publishAllPublicationsToGiteaRepository
```

如果您想要將預構建的套件發佈到註冊表中，可以使用 [`mvn deploy:deploy-file`](https://maven.apache.org/plugins/maven-deploy-plugin/deploy-file-mojo.html) 命令：

```shell
mvn deploy:deploy-file -Durl=https://gitea.example.com/api/packages/{owner}/maven -DrepositoryId=gitea -Dfile=/path/to/package.jar
```

| 參數    | 描述           |
| ------- | -------------- |
| `owner` | 套件的所有者 |

如果存在相同名稱和版本的套件，您無法發佈該套件。您必須先刪除現有的套件。

## 安裝套件

要從套件註冊表中安裝 Maven 套件，請在專案的 `pom.xml` 文件中添加新的依賴項：

```xml
<dependency>
  <groupId>com.test.package</groupId>
  <artifactId>test_project</artifactId>
  <version>1.0.0</version>
</dependency>
```

在 `Gradle Groovy` 中類似的操作如下：

```groovy
implementation "com.test.package:test_project:1.0.0"
```

然後運行：

```shell
mvn install
```

## 支援的命令

```
mvn install
mvn deploy
mvn dependency:get:
```
