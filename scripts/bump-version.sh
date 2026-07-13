#!/bin/bash

# 版本检测与自动打 tag 脚本
# 在 push 到 master 时检测 editor 项目变化，自动 bump 版本并生成 tag

remote="$1"
url="$2"

# 读取 pre-push 传入的信息，检查是否 push 到 master
while read local_ref local_sha remote_ref remote_sha; do
  if [[ "$remote_ref" == "refs/heads/master" ]]; then
    IS_PUSH_TO_MASTER=true
    break
  fi
done

if [[ "$IS_PUSH_TO_MASTER" != "true" ]]; then
  exit 0
fi

REPO_ROOT="$(git rev-parse --show-toplevel)"
EDITOR_DIR="$REPO_ROOT/packages/editor"
PKG_JSON="$EDITOR_DIR/package.json"

# 获取当前 editor 的版本号
CURRENT_VERSION=$(node -p "require('$PKG_JSON').version")
echo "editor 当前版本: $CURRENT_VERSION"

# fetch 最新的 origin/master
git fetch origin master --quiet

# 检查 editor 目录相对于 origin/master 是否有变更
CHANGED=$(git diff origin/master --name-only -- packages/editor/)

if [[ -z "$CHANGED" ]]; then
  echo "packages/editor 无变更，跳过版本更新"
  exit 0
fi

echo "检测到 packages/editor 有变更："
echo "$CHANGED"
echo ""

# 提示用户输入版本类型
echo "请选择版本升级类型："
echo "  1) patch  (当前: $CURRENT_VERSION)"
echo "  2) minor"
echo "  3) major"
echo "  q) 跳过"
echo ""
read -p "输入 (1/2/3/q): " choice

case "$choice" in
  1) BUMP_TYPE="patch" ;;
  2) BUMP_TYPE="minor" ;;
  3) BUMP_TYPE="major" ;;
  q|Q)
    echo "跳过版本更新"
    exit 0
    ;;
  *)
    echo "无效输入，跳过版本更新"
    exit 0
    ;;
esac

# 使用 node 计算新版本号
NEW_VERSION=$(node -e "
  const parts = '$CURRENT_VERSION'.split('.').map(Number);
  const type = '$BUMP_TYPE';
  if (type === 'patch') parts[2]++;
  else if (type === 'minor') { parts[1]++; parts[2] = 0; }
  else if (type === 'major') { parts[0]++; parts[1] = 0; parts[2] = 0; }
  console.log(parts.join('.'));
")

echo ""
echo "版本升级: $CURRENT_VERSION → $NEW_VERSION (type: $BUMP_TYPE)"
echo ""

read -p "确认升级？(y/N): " confirm
if [[ "$confirm" != "y" && "$confirm" != "Y" ]]; then
  echo "已取消"
  exit 0
fi

# 更新 package.json 版本号
cd "$EDITOR_DIR"
npm version "$NEW_VERSION" --no-git-tag-version --silent
cd "$REPO_ROOT"

# 提交版本变更
git add "packages/editor/package.json"
git commit -m "chore: bump editor version to v$NEW_VERSION"

# 打 tag
git tag "v$NEW_VERSION"

echo ""
echo "✅ 版本已更新: v$NEW_VERSION"
echo "✅ Tag 已创建: v$NEW_VERSION"
echo "   push 时会自动带上此 tag"
