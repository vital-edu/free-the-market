export async function convertFile(file: File): Promise<string> {
  const dataFilePromise: Promise<string> = new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e: ProgressEvent<FileReader>) => {
      let dataFile
      dataFile = e.target!.result as string
      dataFile = dataFile.replace(';base64', `;name=${file.name};base64`)
      resolve(dataFile)
    }
    reader.readAsDataURL(file);
  })

  return await dataFilePromise
}

export async function convertFiles(files: Array<File>): Promise<Array<string>> {
  let dataFiles: Array<string> = []

  for (let file of files) {
    dataFiles.push(await convertFile(file))
  }

  return dataFiles
}
