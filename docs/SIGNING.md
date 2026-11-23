# Signing and updates (Noor)

APKs from the "Build APK" workflow are signed with a fixed key kept only as the GitHub Actions
secret `NOOR_KEYSTORE_B64` (base64 of a JKS keystore, alias `androiddebugkey`). The key is not in
this repository. The workflow writes it to a temporary file, and `setup.sh` points the debug
signing config at it (env `NOOR_KS`).

Limits, stated plainly:
- GitHub secrets cannot be read back. The only other copy was kept by the maintainer outside the repo.
  If the secret is deleted or lost, a new key is needed and every installed copy must be uninstalled once.
- This is a sideload update key, not a Play Store upload key. Plan a proper release key before any store.
- Builds made without the secret (forks, other branches without access) use a random debug key and will
  not install over a copy signed with the real key.

Recovery if the secret is lost:
1. `keytool -genkeypair -storetype JKS -keystore noor.ks -storepass android -keypass android -alias androiddebugkey -keyalg RSA -keysize 2048 -validity 10000 -dname "CN=Noor,O=Noor,C=EG"`
2. Store `base64 -w0 noor.ks` as the secret `NOOR_KEYSTORE_B64` and keep an offline copy of `noor.ks`.
3. Users uninstall once. Use Settings > settings backup (copy) before uninstalling if the installed version has it.

Never commit the keystore or paste it in chat.
