import { createOptimizedPicture } from '../../scripts/aem.js';

function moveChildren(source, target) {
  while (source.firstChild) target.append(source.firstChild);
}

function removeEmptyElements(element) {
  element.querySelectorAll('p, div').forEach((child) => {
    if (!child.textContent.trim() && !child.querySelector('a, img, picture')) {
      child.remove();
    }
  });
}

function isActionParagraph(element) {
  if (element.tagName !== 'P') return false;

  const links = element.querySelectorAll('a[href]');
  return links.length === 1 && element.textContent.trim() === links[0].textContent.trim();
}

function decorateActions(body) {
  const actionParagraphs = [...body.children].filter(isActionParagraph);
  if (!actionParagraphs.length) return;

  const actions = document.createElement('div');
  actions.className = 'content-cards-card-actions';

  actionParagraphs.forEach((paragraph) => {
    const link = paragraph.querySelector('a[href]');
    actions.append(link);
    paragraph.remove();
  });

  body.append(actions);
}

/**
 * loads and decorates the content cards block
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const list = document.createElement('ul');

  [...block.children].forEach((row) => {
    const cells = [...row.children];
    const imageCell = cells.find((cell) => cell.querySelector('picture, img'));
    const card = document.createElement('li');
    const article = document.createElement('article');
    const body = document.createElement('div');

    article.className = 'content-cards-card';
    body.className = 'content-cards-card-body';

    if (imageCell) {
      const image = imageCell.querySelector('picture, img');
      const imageWrapper = document.createElement('div');

      imageWrapper.className = 'content-cards-card-image';
      imageWrapper.append(image);
      article.append(imageWrapper);
      removeEmptyElements(imageCell);
    }

    cells.forEach((cell) => {
      if (cell === imageCell && !cell.textContent.trim() && !cell.querySelector('a, img, picture')) return;
      moveChildren(cell, body);
    });

    decorateActions(body);
    article.append(body);
    card.append(article);
    list.append(card);
  });

  list.querySelectorAll('picture > img').forEach((img) => {
    img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]));
  });

  block.replaceChildren(list);
}
