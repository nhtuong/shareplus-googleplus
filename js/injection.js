// Shared DOM.
var originalTextNode = document.createTextNode(' \u00a0-\u00a0 ');
var originalShareNode = document.createElement('span');
originalShareNode.setAttribute('role', 'button');
originalShareNode.setAttribute('class', 'd-h external-share');
originalShareNode.innerHTML = '+';
originalShareNode.innerHTML = '<img src=http://tubizou.net/add/images/shareplus.png>';

var originalBubbleContainer = document.createElement('div');
originalBubbleContainer.setAttribute('class', 'tk3N6e-Ca');
//originalBubbleContainer.setAttribute('style', 'left: 172px; margin-top: 4px');
originalBubbleContainer.innerHTML =
    // content
    '<div class="tk3N6e-Ca-p-b">'+
        '<div class="lgPbs" style="margin-right: 1em; margin-bottom: 0px;"></div>'+
    '</div>'+
    // cross to close
    '<div class="tk3N6e-Ca-kmh2Gb-b tk3N6e-Ca-kmh2Gb" role="button" tabindex="0"><div class="tk3N6e-Ca-uqvIpc"></div></div>';
    // arrow on top
    //+'<div class="tk3N6e-Ca-kc-b tk3N6e-Ca-kc tk3N6e-Ca-Hi" style="left: 20px; "><div class="tk3N6e-Ca-jQ8oHc"></div><div class="tk3N6e-Ca-ez0xG"></div></div>';

	

	
/**
 * Figures out where the direct link URL is for the post within the |dom|.
 * This might change in the future since we are scraping it.
 *
 * @param {Object<HTMLElement>} dom The parent DOM source for the item.
 */
function parseURL(dom) {
  var parent = dom.parentNode.parentNode.parentNode;
  var link = parent.querySelector('a');
  //var link = parent.querySelector('a[target="_blank"]');
  var text = '';
  var title = '';
  if (link) {
    text = parent.querySelector('.a-b-f-i-p-R');
    if (text) {
      text = text.innerText;
    }
    else {
      text = ''; // Empty for now till we figure out what to do.
    }
    link = link.href;
    // Support multiple accounts.
    //link = link.replace(/plus\.google\.com\/u\/(\d*)/, 'plus.google.com');
  }
  return {
    status: link ? true : false,
    link: link,
    text: text,
    title: title
  };
}

/**
 * Removes the bubble from the DOM. Same functionality as the share button.
 *
 * @param {Object<MouseEvent>} event The mouse event.
 */
function destroyBubble(event) {
  var element = event.srcElement.parentNode;
  if (element && element.className != 'tk3N6e-Ca') {
    element = element.parentNode;
  }
  element.parentNode.removeChild(element);
}

function destroyBubble2(event) {
  var element = event.srcElement.parentNode.parentNode;
  if (element && element.className != 'tk3N6e-Ca') {
    element = element.parentNode.parentNode;
  }
  element.parentNode.removeChild(element);
}


/**
 * Creates the social hyperlink image.
 *
 * @param {string} name The name of the social interaction. Twitter || Facebook
 * @param {string} url The post URL.
 * @param {string} result The URL detail request that contains the parsed data.
 * @param {boolean} limit True if you want to limit it to 100 chars.
 *                        later one, we will figure out the max length.
 */
function createSocialLink(name, url, result, limit) {
  var text = limit ? result.text.substring(0, 100) : result.text;
  url = url.replace('\${link}', result.link);
  url = url.replace('\${text}',  encodeURIComponent(text.trim()));
  url = url.replace('\${title}', result.title);

  var a = document.createElement('a');
  a.setAttribute('href', url);
  a.setAttribute('style', 'margin: 0 .4em');
  //a.onclick = destroyBubble;

  var img = document.createElement('img');
  img.setAttribute('src', chrome.extension.getURL('/img/' + name + '.png'));
  img.setAttribute('title', '' + name);
  img.setAttribute('style', 'vertical-align: middle');

  a.appendChild(img);
  return a;
}

/**
 * Creates the bubble overlay. Uses same CSS used in 
 *
 * @param {number} x The mouse x position.
 * @param {number} y The mouse y position.
 * @param {Object<HTMLElement>} src The parent DOM source for the item.
 */
function createBubble(src, event) {
  var bubbleContainer = originalBubbleContainer.cloneNode(true);
  var nodeToFill = bubbleContainer.querySelector('.lgPbs');

  var result = parseURL(src);
  if (result.status) {
	nodeToFill.appendChild(createSocialLink('twitter', 'http://twitter.com/share?url=${link}&text=${text}', result, true));
    nodeToFill.appendChild(createSocialLink('facebook', 'http://www.facebook.com/sharer.php?u=${link}&t=${text}', result));
    nodeToFill.appendChild(createSocialLink('linkedin', 'http://www.linkedin.com/shareArticle?mini=true&url=${link}&title=${title}&summary=${text}', result));
	nodeToFill.appendChild(createSocialLink('digg', 'http://digg.com/submit?phase=2&url=${link}&title=${title}&summary=${text}', result));
	nodeToFill.appendChild(createSocialLink('gbuzz', 'http://www.google.com/buzz/post?url=${link}&title=${title}&message=${text}', result));
	nodeToFill.appendChild(createSocialLink('blogger', 'http://www.blogger.com/blog-this.g?t&u=${link}&title=${title}&n=${text}&pli=1', result));
	nodeToFill.appendChild(createSocialLink('yahoo', 'http://bookmarks.yahoo.com/toolbar/savebm?u=${link}&t=${title}', result));
	nodeToFill.appendChild(createSocialLink('stumbleupon', 'http://www.stumbleupon.com/submit?url=${link}&title=${title}', result));
	nodeToFill.appendChild(createSocialLink('ovsed', 'http://tubizou.net/add/sharer.php?url=${link}&text=${text}', result, true));
	nodeToFill.appendChild(createSocialLink('google', 'https://www.google.com/bookmarks/mark?op=edit&bkmk=${link}&title=${title}', result));
	nodeToFill.appendChild(createSocialLink('technorati', 'http://technorati.com/faves?sub=addfavbtn&add=${link}', result));
	nodeToFill.appendChild(createSocialLink('netvibes', 'http://www.addtoany.com/add_to/netvibes_share?linkurl=${link}&linkname=${title}', result));
	
	
  } else {
    nodeToFill.appendChild(document.createTextNode('This post has no URL to share!'));
  }

  var closeCross = bubbleContainer.querySelector('.tk3N6e-Ca-kmh2Gb');
  nodeToFill.onclick = destroyBubble2;
  closeCross.onclick = destroyBubble;
  
  src.parentNode.appendChild(bubbleContainer);
}

/**
 * On Click event for when sending the link.
 *
 * @param {Object<MouseEvent>} event The mouse event.
 */
function onSendClick(event) {
  var element = event.srcElement.parentNode.querySelector('.tk3N6e-Ca');
  if (!element) {
    createBubble(event.srcElement, event);
  }
  else {
    element.style.display = 'block';
  }
}
/**
 * Render all the items in the current page.
 */
function renderAll() {
  var actionBars = document.querySelectorAll('.a-f-i-bg');
  for (var i = 0; i < actionBars.length; i++) {
    renderItem(actionBars[i]);
  }
}

/**
 * Render the "Share on ..." Link on each post.
 *
 * @param {Object<ModifiedDOM>} event modified event.
 */
function renderItem(itemDOM) {
  if (itemDOM && !itemDOM.classList.contains('gpi-crx')) {
    var shareNode = originalShareNode.cloneNode(true);
    shareNode.onclick = onSendClick;
    itemDOM.appendChild(originalTextNode.cloneNode(true));
    itemDOM.appendChild(shareNode);
    itemDOM.classList.add('gpi-crx');
  }
}

/**
 * Render the "Share on ..." Link on each post.
 */
function onGooglePlusContentModified(e) {
  if (e.target.id.indexOf('update') == 0) {
    var actionBar = e.target.querySelector('.a-f-i-bg');
    renderItem(actionBar);
  }
}

// API to handle when clicking on different HTML5 push API. This somehow doesn't
// play well with DOMSubtreeModified
chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
  if (request.method == 'render') {
    renderAll();
  }
});

// Listen when the subtree is modified for new posts.
var googlePlusContentPane = document.querySelector('.a-b-f-i-oa');
if (googlePlusContentPane) {
   googlePlusContentPane.addEventListener('DOMSubtreeModified', onGooglePlusContentModified, false);
}