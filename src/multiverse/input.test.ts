import { isFormField, insideScrollable, isActivatable } from './input';

test('form fields swallow keys, other elements do not', () => {
  const input = document.createElement('input');
  const textarea = document.createElement('textarea');
  const div = document.createElement('div');
  document.body.append(input, textarea, div);
  expect(isFormField(input)).toBe(true);
  expect(isFormField(textarea)).toBe(true);
  expect(isFormField(div)).toBe(false);
  expect(isFormField(null)).toBe(false);
});

test('wheel inside an overflowing capture-scroll panel stays in the panel', () => {
  const panel = document.createElement('section');
  panel.setAttribute('data-capture-scroll', '');
  const child = document.createElement('p');
  panel.appendChild(child);
  document.body.appendChild(panel);
  Object.defineProperty(panel, 'clientHeight', { value: 200, configurable: true });
  Object.defineProperty(panel, 'scrollHeight', { value: 600, configurable: true });
  expect(insideScrollable(child)).toBe(true);
  Object.defineProperty(panel, 'scrollHeight', { value: 200, configurable: true });
  expect(insideScrollable(child)).toBe(false);
  expect(insideScrollable(document.body)).toBe(false);
});

test('buttons and links are activatable, plain elements are not', () => {
  const button = document.createElement('button');
  const link = document.createElement('a');
  link.setAttribute('href', '#x');
  const div = document.createElement('div');
  document.body.append(button, link, div);
  expect(isActivatable(button)).toBe(true);
  expect(isActivatable(link)).toBe(true);
  expect(isActivatable(div)).toBe(false);
  expect(isActivatable(null)).toBe(false);
});
