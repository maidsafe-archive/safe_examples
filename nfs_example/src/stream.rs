// Copyright 2015 MaidSafe.net limited.
//
// This SAFE Network Software is licensed to you under (1) the MaidSafe.net Commercial License,
// version 1.0 or later, or (2) The General Public License (GPL), version 3, depending on which
// licence you accepted on initial access to the Software (the "Licences").
//
// By contributing code to the SAFE Network Software, or to this project generally, you agree to be
// bound by the terms of the MaidSafe Contributor Agreement, version 1.0.  This, along with the
// Licenses can be found in the root directory of this project at LICENSE, COPYING and CONTRIBUTOR.
//
// Unless required by applicable law or agreed to in writing, the SAFE Network Software distributed
// under the GPL Licence is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.
//
// Please review the Licences for the specific language governing permissions and limitations
// relating to use of the SAFE Network Software.

// ***********************************************************************************************
// This file is a straight copy from a more versatile implementation in maidsafe/safe_launcher
// - https://github.com/maidsafe/safe_launcher/blob/master/src/launcher/ipc_server/ipc_session/stream.rs
// ***********************************************************************************************

pub struct IpcStream {
    writer_stream: ::std::net::TcpStream,
    reader_stream: ::bufstream::BufStream<::std::net::TcpStream>,
}

impl IpcStream {
    pub fn new(stream: ::std::net::TcpStream) -> IpcStream {
        let cloned_stream = stream.try_clone().ok().unwrap();
        IpcStream {
            writer_stream : cloned_stream,
            reader_stream: ::bufstream::BufStream::new(stream),
        }
    }

    pub fn read_payload(&mut self) -> Vec<u8> {
        use byteorder::ReadBytesExt;

        let mut size_buffer = [0; 8];
        self.fill_buffer(&mut size_buffer[..]);

        let size = ::std::io::Cursor::new(&size_buffer[..]).read_u64::<::byteorder::LittleEndian>().ok().unwrap();
        if size == 0 {
            return Vec::new()
        }

        let mut payload = Vec::with_capacity(size as usize);
        unsafe { payload.set_len(size as usize); }

        self.fill_buffer(&mut payload);

        payload
    }

    pub fn write(&mut self, payload: Vec<u8>) {
        use std::io::Write;
        use byteorder::WriteBytesExt;

        let size = payload.len() as u64;
        let mut little_endian_size_bytes = Vec::with_capacity(8);
        little_endian_size_bytes.write_u64::<::byteorder::LittleEndian>(size).ok().unwrap();

        let _ = self.writer_stream.write_all(&little_endian_size_bytes).ok().unwrap();
        let _ = self.writer_stream.write_all(&payload).ok().unwrap();
    }

    fn fill_buffer(&mut self, mut buffer_view: &mut [u8]) {
        use ::std::io::Read;

        while buffer_view.len() != 0 {
            match self.reader_stream.read(&mut buffer_view) {
                Ok(rxd_bytes) => {
                    if rxd_bytes == 0 {
                        return
                    }

                    let temp_buffer_view = buffer_view;
                    buffer_view = &mut temp_buffer_view[rxd_bytes..];
                },
                Err(ref err) if err.kind() == ::std::io::ErrorKind::Interrupted => (),
                Err(err) => panic!("{:?} - Unexpected", err),
            }
        }
    }
}
