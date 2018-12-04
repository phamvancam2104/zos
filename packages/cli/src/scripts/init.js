import LocalController from  '../models/local/LocalController'
import ZosPackageFile from "../models/files/ZosPackageFile"

export default async function init({ name, version, publish = false, dependencies = [], installDependencies = false, force = false, packageFile = new ZosPackageFile() }) {
  if (!name) throw Error('A project name must be provided to initialize the project.')
  
  const controller = new LocalController(packageFile)
  controller.init(name, version, force, publish)
  if (dependencies.length !== 0) await controller.linkDependencies(dependencies, installDependencies)
  controller.writePackage()
}
