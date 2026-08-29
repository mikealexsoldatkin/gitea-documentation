---
date: "2021-07-20T00:00:00+00:00"
slug: "maven"
sidebar_position: 60
---

# Maven 套件註冊表

為您的使用者或組織發布 [Maven](https://maven.apache.org) 套件。

## 需求

要使用 Maven 套件註冊表，您可以使用 [Maven](https://maven.apache.org/install.html) 或 [Gradle](https://gradle.org/install/)。
以下範例使用 `Maven` 和 `Gradle Groovy`。

## 設定套件註冊表

要註冊套件註冊表，您首先需要將存取權杖添加到 [`settings.xml`](https://maven.apache.org/settings.html) 文件中：

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

之後將以下部分添加到您的專案 `pom.xml` 文件中：

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

| 參數           | 描述                                                           |
| -------------- | -------------------------------------------------------------- |
| `access_token` | 您的 [個人存取權杖](development/api-usage.md#認證)。 |
| `owner`        | 套件的擁有者。                                                 |

### Gradle 變體

當您計劃在專案中添加來自 Gitea 實例的一些套件時，應該將其添加到儲存庫部分：

```groovy
repositories {
    // 其他倉庫
    maven { url "https://gitea.example.com/api/packages/{owner}/maven" }
}
```

在 Groovy gradle 中，您可以在發布部分中包含以下腳本：

```groovy
publishing {
    // 發布的其他設置
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

## 發布套件

要發布套件，只需運行：

```shell
mvn deploy
```

或者在使用 gradle 的情況下，調用帶有任務 `publishAllPublicationsToGiteaRepository` 的 `gradle`：

```groovy
./gradlew publishAllPublicationsToGiteaRepository
```

如果您想將預構建的套件發布到註冊表，可以使用 [`mvn deploy:deploy-file`](https://maven.apache.org/plugins/maven-deploy-plugin/deploy-file-mojo.html)：

```shell
mvn deploy:deploy-file -Durl=https://gitea.example.com/api/packages/{owner}/maven -DrepositoryId=gitea -Dfile=/path/to/package.jar
```

| 參數    | 描述           |
| ------- | -------------- |
| `owner` | 套件的擁有者。 |

如果已經存在同名同版本的套件，您不能發布該套件。您必須先刪除現有的套件。

## 安裝套件

要從套件註冊表中安裝 Maven 套件，請在專案 `pom.xml` 文件中添加新的依賴項：

```xml
<dependency>
  <groupId>com.test.package</groupId>
  <artifactId>test_project</artifactId>
  <version>1.0.0</version>
</dependency>
```

在 gradle groovy 中類似：

```groovy
implementation "com.test.package:test_project:1.0.0"
```

之後運行：

```shell
mvn install
```

## 支援的命令

```
mvn install
mvn deploy
mvn dependency:get:
```
