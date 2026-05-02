# VENDOR NOTICE

This repository is **our vendor mirror of `paperclipai/paperclip`**.

- **Upstream:** https://github.com/paperclipai/paperclip
- **Purpose:** preserves a known-good snapshot we can vendor into our agent-cloud stack
- **DO NOT** make local changes to source files here — they will conflict with the next upstream sync
- **DO NOT** pull-request against this repo — open PRs against the real upstream
- All notices, deploy scripts, and patches we maintain ourselves live in `~/IDE/projects/agent-cloud`, NOT here

If you need to synchronize with upstream:

```
git remote add upstream https://github.com/paperclipai/paperclip.git
git fetch upstream
git merge upstream/master   # or rebase, depending on policy
```

— Maintained by Cloud-Ops-Dev