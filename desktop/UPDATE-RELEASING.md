# Desktop update publishing

This document is for the release maintainer. Never publish a release before user testing and explicit approval.

1. Set the same stable version in package.json, lockfile and UI. Build macOS arm64/x64 ZIPs and the x64 Windows NSIS installer. Keep the portable ZIP as an optional manual download.
2. Run tests and install the Mac build for user testing.
3. Once approved, run `npm run prepare:update -- release-vVERSION-local`. The script hashes all three update packages and signs luma-update.json with the local Ed25519 release key.
4. Upload the three matching packages AND luma-update.json to the same stable GitHub release at BravoSignal/luma, with tag vVERSION. Publish it only after all files are present. Drafts and prereleases are not offered by the updater. Never replace packages without regenerating the signed manifest.
5. Confirm the published update on Mac and Windows. Older releases without the manifest remain manual downloads.

The public verification key is bundled at app/update-public.pem. The private key stays outside the source tree in work/luma-release-keys/update-private.pem. Back it up privately; do not upload or commit it. For CI signing, use the LUMA_UPDATE_SIGNING_KEY environment variable pointing to a secret-managed PEM file. Replacing the trusted key without a transition release will prevent existing clients from updating.

The built-in workflow only builds artifacts; it does not publish updates or receive the signing key automatically. Download its artifacts and sign the final set locally, or explicitly configure a protected release signing job later.

Luma checks GitHub's latest stable release after 20 seconds and every six hours. Users can turn automatic checks/downloads off. Downloads are pinned to this repository and release tag, verified against a signed manifest, and rehashed before installation. A single package is cached; obsolete downloads are removed when a newer update is downloaded. Pairing data is not sent to GitHub.

macOS uses a staged application replacement after quitting, with restoration on replacement/launch failure. It does not disable Gatekeeper or remove quarantine. Keep the app in a writable Applications folder. Windows launches the verified NSIS Setup installer. Standard system security prompts still apply. Windows portable users should switch to Setup to maintain one updated installation.
