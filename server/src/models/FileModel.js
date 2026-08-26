import { createModel } from '../db/pgModel.js';

const File = createModel('file', 'files', {
  fields: [
    'id',
    'filename',
    'originalName',
    'url',
    'cloudinaryId',
    'fileType',
    'size',
    'uploadedBy',
    'project',
    'description',
    'isPublic',
  ],
});

export default File;
