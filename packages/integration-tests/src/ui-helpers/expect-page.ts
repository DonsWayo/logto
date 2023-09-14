import { condString } from '@silverhand/essentials';
import { type ElementHandle, type Page } from 'puppeteer';

import { expectNavigation } from '#src/utils.js';

/** Error thrown by {@link ExpectPage}. */
export class ExpectPageError extends Error {
  constructor(
    message: string,
    public readonly page: Page
  ) {
    super(message);
  }
}

/**
 * A class that provides a set of methods to assert the state of page tests and its side effects.
 */
export default class ExpectPage {
  constructor(public readonly page = global.page) {}

  /**
   * Navigate to the given URL and wait for the page to load. Assert that an element with ID `app`
   * is present.
   *
   * @param initialUrl The URL to navigate to.
   */
  async toStart(initialUrl: URL) {
    await expectNavigation(this.page.goto(initialUrl.href), this.page);
    await expect(this.page).toMatchElement('#app');
  }

  /**
   * Click on the element matching the given selector and text.
   *
   * @param selector The selector to match.
   * @param text The text to match, if provided.
   * @param shouldNavigate Whether the click should trigger a navigation. Defaults to `true`.
   */
  async toClick(selector: string, text?: string | RegExp, shouldNavigate = true) {
    const clicked = expect(this.page).toClick(selector, { text });
    return shouldNavigate ? expectNavigation(clicked, this.page) : clicked;
  }

  /**
   * Click on the `<button type="submit">` element on the page.
   *
   * @param shouldNavigate Whether the click should trigger a navigation. Defaults to `true`.
   */
  async toClickSubmit(shouldNavigate = true) {
    return this.toClick('button[type=submit]', undefined, shouldNavigate);
  }

  /**
   * Find the `<form>` element on the page and submit it programmatically.
   *
   * @param shouldNavigate Whether the click should trigger a navigation. Defaults to `true`.
   */
  async toSubmit(shouldNavigate = true) {
    const form = await expect(this.page).toMatchElement('form');
    // eslint-disable-next-line no-restricted-syntax
    const submitted = (form as ElementHandle<HTMLFormElement>).evaluate((form) => {
      form.submit();
    });
    return shouldNavigate ? expectNavigation(submitted, this.page) : submitted;
  }

  /**
   * Fill an `<input>` with the given name with the given value and optionally submit the form.
   *
   * @param name The name of the input to fill.
   * @param value The value to fill the input with.
   * @param options Options to control the behavior of the method.
   * @param options.submit Whether to submit the form after filling the input. Defaults to `false`.
   * @param options.shouldNavigate Whether the submit should trigger a navigation. Defaults to `true`. Note that this
   * option is ignored if `options.submit` is `false`.
   */
  async toFillInput(
    name: string,
    value: string,
    options?: { submit: true; shouldNavigate?: boolean }
  ) {
    await expect(this.page).toFill(`input[name=${name}]`, value);
    if (options?.submit) {
      await this.toClickSubmit(options.shouldNavigate);
    }
  }

  /**
   * Fill a `<form>` with the given values and optionally submit it.
   *
   * @param values The key-value object of values to fill the form with.
   * @param options Options to control the behavior of the method.
   * @param options.submit Whether to submit the form after filling the input. Defaults to `false`.
   * @param options.shouldNavigate Whether the submit should trigger a navigation. Defaults to `true`. Note that this
   * option is ignored if `options.submit` is `false`.
   */
  async toFillForm(
    values: Record<string, string>,
    options?: { submit: true; shouldNavigate?: boolean }
  ) {
    await expect(this.page).toFillForm('form', values);
    if (options?.submit) {
      await this.toClickSubmit(options.shouldNavigate);
    }
  }

  /**
   * Expect the page to match an element with `role="alert"` and optionally with the given text.
   *
   * @param text The text to match, if provided.
   */
  async toMatchAlert(text?: string | RegExp): Promise<ElementHandle> {
    return expect(this.page).toMatchElement('*[role=alert]', { text });
  }

  /**
   * Expect the page's URL to match the given URL.
   *
   * @param url The URL to match.
   */
  toMatchUrl(url: URL | string) {
    expect(this.page.url()).toBe(typeof url === 'string' ? url : url.href);
  }

  /**
   * Navigate to the given URL and wait for the page to be navigated.
   */
  async navigateTo(url: URL | string) {
    const [result] = await Promise.all([
      this.page.goto(typeof url === 'string' ? url : url.href),
      this.page.waitForNavigation({ waitUntil: 'networkidle0' }),
    ]);
    return result;
  }

  /**
   * Expect a toast to appear with the given text, then remove it immediately.
   *
   * @param text The text to match.
   */
  async waitForToast(text: string | RegExp, type?: 'success' | 'error') {
    const toast = await expect(this.page).toMatchElement(
      `[class*=toast]${condString(type && `[class*=${type}]`)}:has(div[class$=message]`,
      {
        text,
      }
    );

    // Remove immediately to prevent waiting for the toast to disappear and matching the same toast again
    await toast.evaluate((element) => {
      element.remove();
    });
  }

  protected throwError(message: string): never {
    throw new ExpectPageError(message, this.page);
  }
}
