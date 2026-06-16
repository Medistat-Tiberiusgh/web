import { COLOR_BRAND, FONT_CONSOLE_TITLE, FONT_CONSOLE_BODY } from '../theme'

/**
 * Logs a welcome message and contribution links to the browser console.
 */
export function logWelcome() {
  console.log(
    '%cWelcome to Medistat!',
    `font-size: ${FONT_CONSOLE_TITLE}px; font-weight: bold; color: ${COLOR_BRAND};`
  )
  console.log(
    '%cDoes this page need fixes or improvements? Join our discussions or contribute to help make Medistat better.',
    `font-size: ${FONT_CONSOLE_BODY}px;`
  )
  console.log(
    `%c🤝 Contribute to Medistat: https://github.com/Medistat-Tiberiusgh`,
    `font-size: ${FONT_CONSOLE_BODY}px; color: ${COLOR_BRAND};`
  )
  console.log(
    `%c💬 Join our discussions: https://github.com/orgs/Medistat-Tiberiusgh/discussions`,
    `font-size: ${FONT_CONSOLE_BODY}px; color: ${COLOR_BRAND};`
  )
}
