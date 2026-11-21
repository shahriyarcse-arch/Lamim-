/** localStorage mirror of the profile theme, read before first paint (no flash). */
export const THEME_STORAGE_KEY = 'lamim:theme';

export const THEME_PREPAINT_SCRIPT = `(function(){try{var t=localStorage.getItem('${THEME_STORAGE_KEY}');if(t!=='light'&&t!=='dark'){t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}document.documentElement.dataset.theme=t;var p=location.pathname;if(p==='/bn'||p.indexOf('/bn/')===0)document.documentElement.lang='bn'}catch(e){}})();`;
