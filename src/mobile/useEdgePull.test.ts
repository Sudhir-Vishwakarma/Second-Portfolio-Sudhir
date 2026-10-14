import { isGestureExempt } from './useEdgePull';

test('gestures starting in form fields, sheets or the filter row are exempt', () => {
  document.body.innerHTML = `
    <textarea id="t"></textarea><input id="i" /><select id="s"></select>
    <div class="mb-sheet"><p id="insheet">x</p></div>
    <div class="mb-filters"><button id="chip">All</button></div>
    <div class="mb-orbit"><span id="planet">p</span></div>
    <div id="plain"><span id="inner">y</span></div>`;
  ['t', 'i', 's', 'insheet', 'chip', 'planet'].forEach((id) => expect(isGestureExempt(document.getElementById(id))).toBe(true));
  expect(isGestureExempt(document.getElementById('inner'))).toBe(false);
  expect(isGestureExempt(null)).toBe(false);
});
