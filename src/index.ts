import {filePath} from './config/config';
import {csv} from './helpers/csv/csv';

console.log(filePath)

csv.read(filePath);
csv.export();
