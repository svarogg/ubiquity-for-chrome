/***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is Ubiquity.
 *
 * The Initial Developer of the Original Code is Mozilla.
 * Portions created by the Initial Developer are Copyright (C) 2007
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *   Michael Yoshitaka Erlewine <mitcho@mitcho.com>
 *   kelopez
 *   Ayhan Eses-ayhan515 <paylasimlarimiz@gmail.com>
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */
 
function makeParser() {
  var tr = new Parser('tr');
  tr.roles = [
	{role: 'goal', delimiter: 'kime'},
	{role: 'goal', delimiter: '�undan'},
	{role: 'goal', delimiter: 'a'},
	{role: 'source', delimiter: 'den'},
	{role: 'source', delimiter: 'de'},
	{role: 'location', delimiter: 'daki'},
	{role: 'time', delimiter: 'de'},
	{role: 'instrument', delimiter: 'dan'},
	{role: 'instrument', delimiter: 'kullanarak'},
	{role: 'format', delimiter: 'olarak'},
	{role: 'alias', delimiter: 'como'},
	{role: 'modifier', delimiter: 'de'},
  ];

  tr.argumentNormalizer = new RegExp('^(el|lo\\s+|la\\s+)(.+)()$','i');
  tr.normalizeArgument = function(input) {
    let matches = input.match(this.argumentNormalizer);
    if (matches != null)
      return [{prefix:matches[1], newInput:matches[2], suffix:matches[3]}];
    return [];
  },

  tr.anaphora = ["bu", "bu", "se�im", "o", "o", "onlar", "onlar"];
  
  tr.branching = 'right';

  tr.clitics = [
    {clitic: 'el', role: 'object'},
    {clitic: 'los', role: 'object'}
  ];

  tr.verbFinalMultiplier = 0.3;

  return tr;
};
