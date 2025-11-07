import Koa from "koa";
import serve from "koa-static";

const app = new Koa();

app.use(serve(`${process.cwd()}/public`));

app.listen({ port: 8080 });
