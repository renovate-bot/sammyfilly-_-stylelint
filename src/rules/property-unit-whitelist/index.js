import { isObject } from "lodash"
import valueParser from "postcss-value-parser"

import {
  declarationValueIndexOffset,
  report,
  ruleMessages,
  validateOptions,
} from "../../utils"

export const ruleName = "property-unit-whitelist"

export const messages = ruleMessages(ruleName, {
  rejected: (p, u) => `Unexpected unit "${u}" for property "${p}"`,
})

export default function (whitelist) {
  return (root, result) => {
    const validOptions = validateOptions(result, ruleName, {
      actual: whitelist,
      possible: [isObject],
    })
    if (!validOptions) { return }

    root.walkDecls(decl => {

      const { prop, value } = decl
      const whitelistInProp = whitelist[prop]

      valueParser(value).walk(function (node) {
        const unit = valueParser.unit(node.value).unit

        if (whitelistInProp && unit && whitelistInProp.indexOf(unit) === -1 && node.type !== "string") {
          report({
            message: messages.rejected(prop, unit),
            node: decl,
            index: declarationValueIndexOffset(decl) + node.sourceIndex,
            result,
            ruleName,
          })
        }
      })
    })
  }
}
