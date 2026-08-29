---
date: "2023-02-25T00:00:00+00:00"
slug: "badge"
sidebar_position: 110
---

# 徽章

Gitea 內置了徽章系統，允許您在其他地方顯示儲存庫的狀態。您可以使用以下徽章：

## 工作流程徽章

Gitea Actions 工作流程徽章是一個顯示最新工作流程運行狀態的徽章。
它設計為與 [GitHub Actions 工作流程徽章](https://docs.github.com/en/actions/monitoring-and-troubleshooting-workflows/adding-a-workflow-status-badge) 相容。

您可以使用以下 URL 獲取徽章：

```
https://your-gitea-instance.com/{owner}/{repo}/actions/workflows/{workflow_file}/badge.svg?branch={branch}&event={event}
```

- `{owner}`: 儲存庫的所有者。
- `{repo}`: 儲存庫的名稱。
- `{workflow_file}`: 工作流程文件的名稱。
- `{branch}`: 可選。工作流程的分支。預設為儲存庫的預設分支。
- `{event}`: 可選。工作流程的事件。預設為無。
