let fs = require('fs');
const path = require("path");

function findProjectRoot(currentPath) {
    // Check if the current path contains the project marker file
    if (fs.existsSync(path.join(currentPath, 'views'))) {
      return currentPath; // Found the project root
    }
  
    // Get the parent directory
    const parentDir = path.dirname(currentPath);
  
    // If we reach the root directory ("/" or "C:\"), stop searching
    if (currentPath === parentDir) {
      throw new Error("Project marker file 'findProjectRoot.js' not found.");
    }
  
    // Recursively search in the parent directory
        return findProjectRoot(parentDir);
}

function saveFile(file,type) {
    var updatedURL = '';
    const maxFileSizeInBytes = 10 * 1024 * 1024;
    var allowedFileExtensions = [];
    if(type==1){
        allowedFileExtensions = ['.jpg', '.jpeg', '.png', '.gif'];
    }else{
        allowedFileExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.pdf', '.doc'];
    }

    const fileObj = file;
    const fileName = fileObj.originalFilename;
    const fileExtension = path.extname(fileName).toLowerCase();
    if (!allowedFileExtensions.includes(fileExtension)) {
        return res.status(400).json({ code: 400, status: 'Validation Error', message: 'Invalid file type. Allowed types are: ' + allowedFileExtensions.join(', ') });
    }
    const fileSizeInBytes = fileObj.size;
    if (fileSizeInBytes > maxFileSizeInBytes) {
        return res.status(400).json({ code: 400, status: 'Validation Error', message: 'File size exceeds the maximum allowed (10MB)'});
    }
    const filePathSource = fileObj.filepath;
    const filenewName = fileObj.newFilename;
    const timestamp = new Date().toISOString().replace(/[-T:]/g, '');
    const randomNumber = Math.floor(1000000 + Math.random() * 9000000);
    const newFileName = `file_${timestamp}_${randomNumber}${fileExtension}`;
    const projectRoot = findProjectRoot(__dirname);
    const newpath = path.join(projectRoot, 'views/public/uploads', newFileName);
    updatedURL = 'uploads/' + newFileName;
    // console.log(updatedURL);
    fs.copyFile(filePathSource, newpath, async function (err) {
        if (err){ 
            return {
                code: 500,
                status: 'Error',
                message: err
            };
        }
    });
    return {
        code: 201,
        status: 'Success',
        message: updatedURL
    };
}

module.exports = {
    saveFile
};