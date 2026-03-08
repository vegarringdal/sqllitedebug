import { TypeChecker } from "esbuild-helpers";

const frontend = TypeChecker({
    basePath: "./",
    name: "typechecker",
    tsConfig: "./tsconfig.json",
    throwOnSemantic: true,
    throwOnSyntactic: true
});

frontend.printSettings();
frontend.inspectAndPrint();
