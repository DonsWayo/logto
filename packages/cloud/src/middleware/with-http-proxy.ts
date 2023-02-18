import type { HttpContext, NextFunction, RequestContext } from '@withtyped/server';
import chalk from 'chalk';
import type { ServerOptions } from 'http-proxy';
import HttpProxy from 'http-proxy';

import { matchPathname } from '#src/utils/url.js';

const { createProxy } = HttpProxy;

export default function withHttpProxy<InputContext extends RequestContext>(
  pathname: string,
  options: ServerOptions
) {
  const proxy = createProxy(options);

  proxy.on('start', (request, __, target) => {
    console.log(
      `\t${chalk.italic(chalk.gray('proxy ->'))}`,
      new URL(request.url ?? '/', typeof target === 'object' ? target.href : target).toString()
    );
  });

  return async (
    context: InputContext,
    next: NextFunction<InputContext>,
    { request, response }: HttpContext
  ) => {
    const {
      request: { url },
    } = context;

    const matched = matchPathname(pathname, url.pathname);

    if (!matched) {
      return next(context);
    }

    await new Promise<void>((resolve) => {
      response.once('finish', resolve);
      proxy.web(request, response, options);
    });

    return next({ ...context, status: 'ignore' });
  };
}

export type { ServerOptions } from 'http-proxy';
