import { registerGlobalPlugins } from "@module-federation/runtime";

const protocol = "module-federation";
const windowsProtocolOrigin = `http://${protocol}.localhost`;

/**
 * @typedef {Parameters<NonNullable<import("@module-federation/runtime").ModuleFederationRuntimePlugin["afterResolve"]>>[0]} LoadRemoteMatch
 */

function usesWindowsProtocolOrigin() {
	return typeof navigator !== "undefined" && /Windows|Android/i.test(navigator.userAgent);
}

/**
 * @param {URL} url
 */
function createPluginUrl(url) {
	const fullUrl = encodeURIComponent(url.href);

	if (usesWindowsProtocolOrigin()) {
		return `${windowsProtocolOrigin}/${url.host}${url.pathname}?fullUrl=${fullUrl}`;
	}

	return `${protocol}://${url.host}${url.pathname}?fullUrl=${fullUrl}`;
}

/**
    @param {LoadRemoteMatch} args
 */
function afterResolve(args) {
	const url = new URL(args.remoteInfo.entry);
	args.remoteInfo.entry = createPluginUrl(url);
	return args;
}

const hostPlugin = () => {
	/** @type {import("@module-federation/runtime").ModuleFederationRuntimePlugin} */
	const plugin = {
		name: "tauri-module-federation-host",
		afterResolve,
		beforeInit: (args) => {
			registerGlobalPlugins([
				{ name: "tauri-module-federation-global", afterResolve },
			]);
			return args;
		},
	};
	return plugin;
};

export default hostPlugin;
