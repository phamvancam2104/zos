import path from 'path';
import { FileSystem } from 'zos-lib';
import { RawContract } from './SolidityContractsCompiler';

export default {
  call(dependencyPath: string): RawContract {
    const nmDependency = this._tryNodeModulesDependency(dependencyPath);
    return nmDependency || this._tryProjectDependency(dependencyPath);
  },

  _tryNodeModulesDependency(dependencyPath: string): RawContract {
    const fileName = this._getFileName(dependencyPath);
    const filePath = path.resolve(process.cwd(), 'node_modules', dependencyPath);
    if (FileSystem.exists(filePath)) return this._buildContract(filePath, fileName);
  },

  _tryProjectDependency(dependencyPath: string): RawContract {
    const rootDir = process.cwd();
    const dependencyName = this._getFileName(dependencyPath);
    const fileNames = FileSystem.readDir(rootDir);

    for (const fileName of fileNames) {
      const filePath = path.resolve(rootDir, fileName);
      if (fileName === dependencyName) return this._buildContract(filePath, fileName);
      if (FileSystem.isDir(filePath)) {
        const dependencyContract = this._findDependencyContract(filePath, dependencyName);
        if (dependencyContract) return dependencyContract;
      }
    }
  },

  _findDependencyContract(filePath: string, fileName: string, dependencyName: string): RawContract {
    if (fileName === dependencyName) return this._buildContract(filePath, fileName);
    else if (FileSystem.isDir(filePath)) {
      const subFileNames = FileSystem.readDir(filePath);
      for (const subFileName of subFileNames) {
        const subFilePath = path.resolve(filePath, subFileName);
        const result = this._findDependencyContract(subFilePath, subFileName, dependencyName);
        if (result) return result;
      }
    }
  },

  _buildContract(filePath: string, fileName: string): RawContract {
    const source = FileSystem.read(filePath);
    return { fileName, filePath, source };
  },

  _getFileName(filePath: string): string {
    return filePath.substring(filePath.lastIndexOf('/') + 1);
  },
};
