const VIDEO_PLACEHOLDER_CLASS = 'video-placeholder';

const embedYoutube = (url, autoplay) => {
  const usp = new URLSearchParams(url.search);
  const suffix = autoplay ? '&muted=1&autoplay=1' : '';
  let vid = encodeURIComponent(usp.get('v'));
  const embed = url.pathname;
  if (url.origin.includes('youtu.be')) {
    [, vid] = url.pathname.split('/');
  }
  const embedHTML = `<div style="left: 0; width: 100%; height: 0; position: relative; padding-bottom: 56.25%;">
      <iframe src="https://www.youtube.com${vid ? `/embed/${vid}?rel=0&v=${vid}${suffix}` : embed}" style="border: 0; top: 0; left: 0; width: 100%; height: 100%; position: absolute;" 
      allow="autoplay; fullscreen; picture-in-picture; encrypted-media; accelerometer; gyroscope; picture-in-picture" allowfullscreen="" scrolling="no" title="Content from Youtube" loading="lazy"></iframe>
    </div>`;
  return embedHTML;
};

const embedVimeo = (url, autoplay) => {
  const [, video] = url.pathname.split('/');
  const suffix = autoplay ? '?muted=1&autoplay=1' : '';
  const embedHTML = `<div style="left: 0; width: 100%; height: 0; position: relative; padding-bottom: 56.25%;">
      <iframe src="https://player.vimeo.com/video/${video}${suffix}" 
      style="border: 0; top: 0; left: 0; width: 100%; height: 100%; position: absolute;" 
      frameborder="0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen  
      title="Content from Vimeo" loading="lazy"></iframe>
    </div>`;
  return embedHTML;
};

const loadEmbed = (container, link, autoplay) => {
  if (container.classList.contains('embed-is-loaded')) {
    return;
  }

  const EMBEDS_CONFIG = [
    {
      match: ['youtube', 'youtu.be'],
      embed: embedYoutube,
    },
    {
      match: ['vimeo'],
      embed: embedVimeo,
    },
  ];

  const config = EMBEDS_CONFIG.find((e) => e.match.some((match) => link.includes(match)));
  const url = new URL(link);
  if (config) {
    container.innerHTML = config.embed(url, autoplay);
    container.classList = `${VIDEO_PLACEHOLDER_CLASS} embed-${config.match[0]}`;
  }
  container.classList.add('embed-is-loaded');
};

export default function decorate(block) {
  // judge if its a two column block
  const h1 = block.querySelector('h1');
  const col1 = h1?.closest('div');
  const col2 = col1?.nextElementSibling;
  col1.classList.add('info');
  const titleImageContainer = col1.parentElement;
  titleImageContainer.classList.add('title-image-container');
  if (col2 && col2.querySelector('picture')) {
    // add two-image-hero class
    titleImageContainer.classList.add('two-column-hero');
    col2.classList.add('right-col');
    const linkElem = col2.querySelector('a');
    if (linkElem) {
      const link = linkElem.href;
      if (link.includes('youtube') || link.includes('youtu.be')) {
        // video is present
        const videoContainer = col2; // document.createElement('div');
        const placeholder = col2.querySelector('picture');
        videoContainer.textContent = '';
        const wrapper = document.createElement('div');
        wrapper.className = VIDEO_PLACEHOLDER_CLASS;
        if (placeholder) {
          wrapper.innerHTML = '<div class="video-placeholder-play"><button title="Play">'
            + '<span class="icon icon-play"><svg xmlns="http://www.w3.org/2000/svg"><use href="#icons-sprite-play"></use></svg></span></button></div>';
          wrapper.addEventListener('click', () => {
            loadEmbed(wrapper, link, true);
          });
          wrapper.prepend(placeholder);
        } else {
          loadEmbed(wrapper, link);
        }
        videoContainer.append(wrapper);
        // col2.appendChild(videoContainer);
        linkElem.remove();
      }
    }
    // add another div for left-col so that info takes only 66-83% of it
    const leftCol = document.createElement('div');
    leftCol.appendChild(col1);
    leftCol.classList.add('left-col');
    titleImageContainer.prepend(leftCol);
  } else if (col1.querySelector('picture')) {
    // add gradient overlay
    const gradientDiv = document.createElement('div');
    gradientDiv.classList.add('gradient-default');
    gradientDiv.appendChild(col1.querySelector('picture'));
    block.prepend(gradientDiv);
  }
}
