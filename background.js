let state=-1;
chrome.browserAction.onClicked.addListener(
function () {
 state=state*-1;
 chrome.browserAction.setIcon({path: 'icon'+state+'.png' });
}
);
chrome.browserAction.setIcon({path: 'icon'+state+'.png' });

let gnum=0;
function save(details,returninfo) {
chrome.tabs.executeScript(details.tabId, {code:'('+returninfo+')()'}, (info) => {
	info=info[0];
	info.artist=info?.artist || 'na';
	info.album=info?.album || 'na';
// 	info.track=info?.track || 'na';
	info.num=info?.num || ++gnum; if (info.num) { info.num = `${info.num} - `; }
	info.year=info?.year || ''; if (info.year) { info.year = `${info.year} - `; }
	console.log(`downloaded to mudownloader/${info.artist}/${info.year}${info.album}/${info.num}${info.track}.mp3`);
	chrome.downloads.download({
		url:details.url,
		filename:`mudownloader/${info.artist}/${info.year}${info.album}/${info.num}${info.track}.mp3`,
		conflictAction:"overwrite",
		method:"GET"
	});
});
}


// // YANDEX MUSIC

chrome.webRequest.onBeforeSendHeaders.addListener(
function(details) {
let stop=0;
if (state<0) {stop=1;console.log('stop: ON');}
if (details.type && details.type!=='media') {stop=1;console.log('stop: type not media');}
if (details.initiator && !details.initiator.match(/https:/)) {stop=1;console.log('stop: not initiator');}
if (details.method!=='GET') {stop=1;console.log('stop: method not get');}
if (stop) { return; }
let stopr=1;
for (var i = 0; i < details.requestHeaders.length; ++i) {
	if (details.requestHeaders[i].name === 'Range') { stopr=0; }
	if (details.requestHeaders[i].name === 'Range' && details.requestHeaders[i].value !== 'bytes=0-') { return; }
}
if (stopr) { console.log('stopr'); return; }

save(details, ()=>{
return {
	artist:	document.querySelector('.d-album-summary .d-artists').innerText.replace(/[^\w\s]/g,''),
	album:	document.querySelector('.page-album__title').innerText.replace(/[^\w\s]/g,''),
	track:	document.querySelector('.d-track_playing .d-track__title').innerText.replace(/[^\w\s]/g,''),
	num:	document.querySelector('.d-track_playing .d-track__id').innerText.replace(/[^\w\s]/g,''),
	year:	document.querySelector('.d-album-summary__group .typo').innerText.replace(/\D/,''),
}
});

}, {urls:["https://*.storage.yandex.net/get-mp3/*"]}, ["requestHeaders"]
);


// // BANDCAMP

chrome.webRequest.onBeforeSendHeaders.addListener(
function(details) {
let stop=0;
if (state<0) {stop=1;console.log('stop: ON');}
if (details.type && details.type!=='media') {stop=1;console.log('stop: type not media');}
if (details.initiator && !details.initiator.match(/https:/)) {stop=1;console.log('stop: not initiator');}
if (details.method!=='GET') {stop=1;console.log('stop: method not get');}
if (stop) { return; }
let stopr=1;
for (var i = 0; i < details.requestHeaders.length; ++i) {
	if (details.requestHeaders[i].name === 'Range') { stopr=0; }
	if (details.requestHeaders[i].name === 'Range' && details.requestHeaders[i].value !== 'bytes=0-') { return; }
}
if (stopr) { console.log('stopr'); return; }

save(details, ()=>{
return {
	artist:	EmbedData.artist,
	album:	EmbedData.album_title,
	track:	document.querySelector('.play_status.playing').closest('tr').querySelector('.track-title').innerText.replace(/[^\w\s]/g,''),
	num:	document.querySelector('.play_status.playing').closest('tr').querySelector('.track_number').innerText.replace(/\D/,''),
	year:	new Date(EmbedData.embed_info.public_embeddable).getFullYear()
}
});

}, {urls:["https://*.bcbits.com/stream/*"]}, ["requestHeaders"]
);


