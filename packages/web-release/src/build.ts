import { existsSync, readFileSync } from "node:fs";
import { basename, resolve } from "node:path";
import { spawn } from "node:child_process";

export function run(
  command: string,
  args: string[],
  cwd: string
): Promise<void> {
  return new Promise((resolvePromise, reject) => {
    console.log(`> ${command} ${args.join(" ")}`);
    const child = spawn(command, args, {
      cwd,
      stdio: "inherit",
      shell: process.platform === "win32",
      env: process.env,
    });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) resolvePromise();
      else
        reject(
          new Error(`命令失败 (exit ${code}): ${command} ${args.join(" ")}`)
        );
    });
  });
}

export function resolveCwdProject(cwd: string): {
  projectDir: string;
  packageName: string;
  dirName: string;
  distDir: string;
} {
  const pkgPath = resolve(cwd, "package.json");
  if (!existsSync(pkgPath)) {
    throw new Error(`当前目录没有 package.json: ${cwd}`);
  }
  const pkg = JSON.parse(readFileSync(pkgPath, "utf8")) as {
    name?: string;
    scripts?: Record<string, string>;
  };
  if (!pkg.scripts?.build) {
    throw new Error(`package.json 中没有 build 脚本: ${pkgPath}`);
  }
  const dirName = basename(cwd);
  return {
    projectDir: cwd,
    packageName: pkg.name || dirName,
    dirName,
    distDir: resolve(cwd, "dist"),
  };
}

/** 在当前工程目录执行 pnpm build */
export async function runPnpmBuild(cwd: string): Promise<void> {
  await run("pnpm", ["build"], cwd);
  const distDir = resolve(cwd, "dist");
  if (!existsSync(distDir)) {
    throw new Error(`构建完成但未找到产物目录: ${distDir}`);
  }
}
