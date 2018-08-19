export const isIE = () => {
    return /MSIE \d|Trident.*rv:/.test(navigator.userAgent);
}

export const appendScriptTag = (src) => {
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    document.body.appendChild(script);
}
