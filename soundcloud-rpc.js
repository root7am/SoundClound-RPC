/* SoundCloud Rich Presence · By @Yooos & @3d3n.c */
const RPC  = require('discord-rpc');
const CDP  = require('chrome-remote-interface');

const CLIENT_ID       = '1388081777704304691';       
const GITHUB_LINK     = 'https://github.com/root7am'; 
const LARGE_IMAGE_KEY = 'sc_logo';   
const SMALL_IMAGE_KEY = 'cover';     
const POLL_INTERVAL   = 5000;       


const truncate = (s, n = 128) => (s && s.length > n ? s.slice(0, n - 3) + '...' : s);
const strToMs = str => {
  if (!str) return null;
  const p = str.split(':').map(Number);
  return p.some(isNaN) ? null
       : p.length === 2 ? (p[0] * 60 + p[1]) * 1000
       : p.length === 3 ? (p[0] * 3600 + p[1] * 60 + p[2]) * 1000
       : null;
};

async function fetchTrackInfo() {
  const tab = (await CDP.List()).find(t => t.url.includes('soundcloud.com'));
  if (!tab) return null;

  const c = await CDP({ target: tab });
  const { Runtime } = c; await Runtime.enable();
  const { result } = await Runtime.evaluate({
    returnByValue: true,
    expression: `
      (()=> {
  const $ = q => document.querySelector(q);
  const titleSpan = $('.playbackSoundBadge__titleLink span:nth-of-type(2)');
  const title = titleSpan?.textContent.trim() || null;

  const artist = $('.playbackSoundBadge__lightLink')?.textContent.trim() || null;

  const elapsedSpan = $('.playbackTimeline__timePassed span:nth-of-type(2)');
  const elapsedStr = elapsedSpan?.textContent.trim()
  const durationSpan = $('.playbackTimeline__duration span:nth-of-type(2)') || $('.playbackTimeline__totalDuration span:nth-of-type(2)');
  const durationStr= durationSpan?.textContent.trim()

  return { title, artist, elapsedStr, durationStr };
})()
    `
  });
  await c.close(); return result.value;
}


const rpc = new RPC.Client({ transport: 'ipc' });

rpc.on('ready', () => {
  console.log('✅ Connecté à Discord RPC.');
  setInterval(async () => {
    try {
      const info = await fetchTrackInfo();
      if (!info?.title || !info?.artist) return rpc.clearActivity().catch(()=>{});

      const timeDisplay = `${info.elapsedStr} / ${info.durationStr}`;

    rpc.setActivity({
    details       : truncate(`🎵 ${info.title} — ${info.artist}`),
    state         : `⌛ ${timeDisplay}`,
    largeImageKey : LARGE_IMAGE_KEY,
    largeImageText: info.title,
    smallImageKey : SMALL_IMAGE_KEY,
    smallImageText: info.artist,
    instance      : false,
    buttons: [
    {
      label: 'Download on GitHub',
      url: GITHUB_LINK
    }
  ]
});
    } catch (e) { console.error('Erreur RPC :', e); }
  }, POLL_INTERVAL);
});

rpc.login({ clientId: CLIENT_ID }).catch(console.error);
