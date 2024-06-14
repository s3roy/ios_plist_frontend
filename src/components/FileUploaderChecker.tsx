import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  Input,
  Stack,
  Text,
  useToast,
  Spinner,
  Center,
} from '@chakra-ui/react';
import axios from 'axios';

interface MatchedKey {
  key: string;
  appName: string;
  hash: string;
}

const FileUploaderChecker: React.FC = () => {
  const [appName, setAppName] = useState<string>('');
  const [matchedKeys, setMatchedKeys] = useState<MatchedKey[]>([]);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const toast = useToast();

  const handleUpload = useCallback(() => {
    if (!uploadFile) return;

    const formData = new FormData();
    formData.append('file', uploadFile);
    formData.append('appName', appName);

    setIsUploading(true);

    axios.post('https://svr-chatapp.gleeze.com/app/upload', formData)
      .then((response) => {
        setIsUploading(false);
        toast({
          title: 'File uploaded successfully',
          description: `File: ${response.data.filename}\nMessage: ${response.data.message}`,
          status: 'success',
          duration: 5000,
          isClosable: true,
        });

        // Convert CSV string to Blob
        const blob = new Blob([response.data.file], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'uploaded_data.csv');
        document.body.appendChild(link);
        link.click();
        link.parentNode?.removeChild(link);
      })
      .catch((error) => {
        setIsUploading(false);
        toast({
          title: 'Error uploading file',
          description: error.message,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      });
  }, [appName, uploadFile, toast]);

  const handleCheck = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    const formData = new FormData();
    formData.append('file', file);
    if (appName) {
      formData.append('appName', appName);
    }

    setIsChecking(true);

    axios.post('https://svr-chatapp.gleeze.com/app/check', formData)
      .then((response) => {
        setIsChecking(false);
        setMatchedKeys(response.data.entries);

        // Convert CSV string to Blob
        const blob = new Blob([response.data.file], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'matched_data.csv');
        document.body.appendChild(link);
        link.click();
        link.parentNode?.removeChild(link);

        toast({
          title: 'File checked successfully',
          description: `File: ${response.data.filename}\nFound ${response.data.matchedCount} matching keys.`,
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      })
      .catch((error) => {
        setIsChecking(false);
        toast({
          title: 'Error checking file',
          description: error.message,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      });
  }, [appName, toast]);

  const onDropUpload = useCallback((acceptedFiles: File[]) => {
    setUploadFile(acceptedFiles[0]);
  }, []);

  const onDropCheck = useCallback((acceptedFiles: File[]) => {
    handleCheck(acceptedFiles);
  }, [handleCheck]);

  const { getRootProps: getRootPropsUpload, getInputProps: getInputPropsUpload, isDragActive: isDragActiveUpload } = useDropzone({ onDrop: onDropUpload });
  const { getRootProps: getRootPropsCheck, getInputProps: getInputPropsCheck, isDragActive: isDragActiveCheck } = useDropzone({ onDrop: onDropCheck });

  return (
    <Container maxW="container.xl" py={8}>
      <Heading as="h1" mb={6} textAlign="center">
        File Uploader and Checker
      </Heading>
      <Flex>
        <Box flex="1" mr={2}>
          <Heading as="h2" size="md" mb={4}>Upload File with App Name</Heading>
          <Flex
            {...getRootPropsUpload()}
            border="2px dashed"
            borderColor={isDragActiveUpload ? 'teal.500' : 'gray.300'}
            borderRadius="md"
            p={6}
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            bg={isDragActiveUpload ? 'teal.50' : 'gray.50'}
            cursor="pointer"
          >
            <input {...getInputPropsUpload()} />
            {isDragActiveUpload ? (
              <Text>Drop the files here ...</Text>
            ) : (
              <Text>Drag 'n' drop some files here, or click to select files</Text>
            )}
          </Flex>
          <Stack spacing={4} mt={4}>
            <Input
              placeholder="Application Name"
              value={appName}
              onChange={(e) => setAppName(e.target.value)}
              isRequired
            />
            <Button onClick={handleUpload} isLoading={isUploading}>
              Upload File
            </Button>
          </Stack>
        </Box>
        <Box flex="1" ml={2}>
          <Heading as="h2" size="md" mb={4}>Check File for Matching Keys</Heading>
          <Flex
            {...getRootPropsCheck()}
            border="2px dashed"
            borderColor={isDragActiveCheck ? 'teal.500' : 'gray.300'}
            borderRadius="md"
            p={6}
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            bg={isDragActiveCheck ? 'teal.50' : 'gray.50'}
            cursor="pointer"
          >
            <input {...getInputPropsCheck()} />
            {isDragActiveCheck ? (
              <Text>Drop the files here ...</Text>
            ) : (
              <Text>Drag 'n' drop some files here, or click to select files</Text>
            )}
          </Flex>
          {isChecking ? (
            <Center mt={4}>
              <Spinner size="xl" />
            </Center>
          ) : (
            matchedKeys.length > 0 && (
              <Box mt={4}>
                <Heading as="h3" size="sm" mb={2}>Matched Keys</Heading>
                <Flex wrap="wrap">
                  {matchedKeys.map((key, index) => (
                    <Box key={index} bg="red.200" p={2} m={1} borderRadius="md">
                      {key.key}
                    </Box>
                  ))}
                </Flex>
              </Box>
            )
          )}
        </Box>
      </Flex>
    </Container>
  );
};

export default FileUploaderChecker;
