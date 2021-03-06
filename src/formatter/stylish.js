/**
 * From ESLint: https://github.com/eslint/eslint/blob/master/lib/formatters/stylish.js
 * @fileoverview Stylish reporter
 * @author Sindre Sorhus
 */

'use strict';

const stripAnsi = require('strip-ansi');
const table = require('text-table');
const chalk = require('chalk');
const constant = require('../constants');


//------------------------------------------------------------------------------
// Helpers
//------------------------------------------------------------------------------

/**
 * Given a word and a count, append an s if count is not one.
 * @param {string} word A word in its singular form.
 * @param {int} count A number controlling whether word should be pluralized.
 * @returns {string} The original word with an s on the end if count is not one.
 */
const pluralize = (word, count) => (count === 1 ? word : `${word}s`);

//------------------------------------------------------------------------------
// Public Interface
//------------------------------------------------------------------------------

module.exports = (results) => {
  let output = '\n';
  let summaryColor = 'yellow';

  const errorCount = results.filter(result => result.level === constant.LEVEL_ERROR).length;
  const warningCount = results.filter(result => result.level === constant.LEVEL_WARN).length;

  output += table(
    results.map((result) => {
      let resultType;

      if (result.level === constant.LEVEL_ERROR) {
        resultType = chalk.red('error');
        summaryColor = 'red';
      } else {
        resultType = chalk.yellow('warning');
      }

      return [
        '',
        result.header || '',
        result.column || 0,
        resultType,
        result.message.replace(/([^ ])\.$/, '$1'),
        chalk.dim(result.ruleId || ''),
      ];
    }),
    {
      align: ['', 'r', 'l'],
      stringLength(str) {
        return stripAnsi(str).length;
      },
    } // eslint-disable-line comma-dangle
  ).split('\n').map(el => el.replace(/(\d+)\s+(\d+)/, (m, p1, p2) => chalk.dim(`${p1}:${p2}`))).join('\n');

  const total = errorCount + warningCount;

  if (total > 0) {
    output += '\n\n';
    output += chalk.keyword(summaryColor).bold([
      '   \u2716 ', total, pluralize(' problem', total),
      ' (', errorCount, pluralize(' error', errorCount), ', ',
      warningCount, pluralize(' warning', warningCount), ')\n',
    ].join(''));
  }

  return total > 0 ? output : '';
};
