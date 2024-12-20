import type { Options } from "../options.ts";
import type * as N from "../types.ts";
import { getOptions } from "../options.ts";
import StatementParser from "./statement.ts";
import ScopeHandler from "../util/scope.ts";

export type PluginsMap = Map<
  string,
  {
    [x: string]: any;
  }
>;

export default class Parser extends StatementParser {
  // Forward-declaration so typescript plugin can override jsx plugin
  // todo(flow->ts) - this probably can be removed
  // abstract jsxParseOpeningElementAfterName(
  //   node: N.JSXOpeningElement,
  // ): N.JSXOpeningElement;

  constructor(
    options: Options | undefined | null,
    input: string,
    pluginsMap: PluginsMap,
  ) {
    options = getOptions(options);
    super(options, input);

    this.options = options;
    this.initializeScopes();
    this.plugins = pluginsMap;
    this.filename = options.sourceFilename;
    this.startIndex = options.startIndex;
  }

  // This can be overwritten, for example, by the TypeScript plugin.
  getScopeHandler(): new (...args: any) => ScopeHandler {
    return ScopeHandler;
  }

  parse(): N.File {
    this.enterInitialScopes();
    const file = this.startNode<N.File>();
    const program = this.startNode<N.Program>();
    this.nextToken();
    file.errors = null;
    this.parseTopLevel(file, program);
    file.errors = this.state.errors;
    file.comments.length = this.state.commentsLen;
    return file as N.File;
  }
}
