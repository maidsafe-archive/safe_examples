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

extern crate regex;
extern crate byteorder;
extern crate bufstream;
extern crate sodiumoxide;
extern crate rustc_serialize;

mod stream;

fn get_base64_config() -> rustc_serialize::base64::Config {
    rustc_serialize::base64::Config {
        char_set   : rustc_serialize::base64::CharacterSet::Standard,
        newline    : rustc_serialize::base64::Newline::LF,
        pad        : true,
        line_length: None,
    }
}

fn slice_equal(lhs: &[u8], rhs: &[u8]) -> bool {
    lhs.len() == rhs.len() &&
        lhs.iter().zip(rhs.iter()).all(|elt| elt.0 == elt.1)
}

#[derive(Debug, RustcEncodable)]
struct HandshakeJson {
    endpoint: String,
    data: HandshakeData,
}

#[derive(Debug, RustcEncodable)]
struct HandshakeData {
    launcher_string: String,
    asymm_nonce: String,
    asymm_pub_key: String,
}

#[derive(Debug, RustcDecodable)]
struct HandshakeResponse {
    id: String,
    data: HandshakeResponseData,
}

#[derive(Debug, RustcDecodable)]
struct HandshakeResponseData {
    encrypted_symm_key: String,
    launcher_public_key: String,
}

#[derive(Debug, RustcEncodable)]
struct CreateDir {
    endpoint: String,
    data: CreateDirData,
}

#[derive(Debug, RustcEncodable)]
struct CreateDirData {
    is_path_shared: bool,
    dir_path: String,
    is_private: bool,
    is_versioned: bool,
    user_metadata: String,
}

#[derive(Debug, RustcDecodable)]
struct GenericResponse {
    id: String,
    error: ErrorData,
}

#[derive(Debug, RustcDecodable)]
struct ErrorData {
    code: i64,
    description: String,
}

#[derive(Debug, RustcEncodable)]
struct GetDir {
    endpoint: String,
    data: GetDirData,
}

#[derive(Debug, RustcEncodable)]
struct GetDirData {
    timeout_ms: i64,
    is_path_shared: bool,
    dir_path: String,
}

#[derive(Debug, RustcDecodable)]
struct GetDirResponse {
    id: String,
    data: GetDirResponseData,
}

#[derive(Debug, RustcDecodable)]
struct GetDirResponseData {
    info: DirInfo,
    sub_directories: Vec<DirInfo>,
    files: Vec<FileInfo>,
}

#[derive(Debug, RustcDecodable)]
struct DirInfo {
    name: String,
    creation_time_sec: i64,
    creation_time_nsec: i64,
    modification_time_sec: i64,
    modification_time_nsec: i64,
    is_private: bool,
    is_versioned: bool,
    user_metadata: String,
}

#[derive(Debug, RustcDecodable)]
struct FileInfo {
    name: String,
    size: i64,
    creation_time_sec: i64,
    creation_time_nsec: i64,
    modification_time_sec: i64,
    modification_time_nsec: i64,
    user_metadata: String,
}

fn main() {
    use rustc_serialize::base64::ToBase64;
    use rustc_serialize::base64::FromBase64;

    println!("\n======================================================\n");
    println!("App: Begin test app...");
    let mut arg_vec = Vec::with_capacity(3);
    for it in std::env::args() {
        arg_vec.push(it);
    }

    // Authentication
    let main_arg = arg_vec[2].clone();

    let re = regex::Regex::new(r"^tcp:(.+?:\d+):(.+)$").unwrap();
    let captures = re.captures(&main_arg).unwrap();

    let ep = captures.at(1).unwrap().to_string();
    let str_nonce = captures.at(2).unwrap().to_string();

    println!("Ep {}, Nonce: {}", ep, str_nonce);

    let (pub_key, priv_key) = sodiumoxide::crypto::box_::gen_keypair();
    let asym_nonce = sodiumoxide::crypto::box_::gen_nonce();

    let pub_key_b64 = pub_key.0.to_base64(get_base64_config());
    let asym_nonce_b64 = asym_nonce.0.to_base64(get_base64_config());

    let handshake_data = HandshakeData {
        launcher_string: str_nonce,
        asymm_nonce: asym_nonce_b64,
        asymm_pub_key: pub_key_b64,
    };

    let handshake_json = HandshakeJson {
        endpoint: "safe-api/v1.0/handshake/authenticate-app".to_string(),
        data: handshake_data,
    };

    let json_str_handshake = rustc_serialize::json::encode(&handshake_json).unwrap();

    let strm = std::net::TcpStream::connect(&ep[..]).ok().unwrap();
    let mut ipc_stream = stream::IpcStream::new(strm);

    ipc_stream.write(json_str_handshake.into_bytes());

    let handshake_payload = ipc_stream.read_payload();
    let payload_str = String::from_utf8(handshake_payload).ok().unwrap();

    let handshake_response: HandshakeResponse = rustc_serialize::json::decode(&payload_str).ok().unwrap();
    println!("App: HandshakeResponse decoded");

    let vec_encrypted_symm_key_nonce = handshake_response.data.encrypted_symm_key.from_base64().ok().unwrap();
    let vec_launcher_pub_key = handshake_response.data.launcher_public_key.from_base64().ok().unwrap();
    let mut launcher_pub_key = sodiumoxide::crypto::box_::PublicKey([0; sodiumoxide::crypto::box_::PUBLICKEYBYTES]);

    assert_eq!(vec_launcher_pub_key.len(), sodiumoxide::crypto::box_::PUBLICKEYBYTES);

    for it in vec_launcher_pub_key.iter().enumerate() {
        launcher_pub_key.0[it.0] = *it.1;
    }

    let vec_decrypted_symm_key_nonce = sodiumoxide::crypto::box_::open(&vec_encrypted_symm_key_nonce,
                                                                       &asym_nonce,
                                                                       &launcher_pub_key,
                                                                       &priv_key).ok().unwrap();

    assert_eq!(vec_decrypted_symm_key_nonce.len(), sodiumoxide::crypto::secretbox::NONCEBYTES + sodiumoxide::crypto::secretbox::KEYBYTES);

    let mut symm_key = sodiumoxide::crypto::secretbox::Key([0; sodiumoxide::crypto::secretbox::KEYBYTES]);
    let mut symm_nonce = sodiumoxide::crypto::secretbox::Nonce([0; sodiumoxide::crypto::secretbox::NONCEBYTES]);

    for it in vec_decrypted_symm_key_nonce.iter().take(sodiumoxide::crypto::secretbox::NONCEBYTES).enumerate() {
        symm_nonce.0[it.0] = *it.1;
    }
    for it in vec_decrypted_symm_key_nonce.iter().skip(sodiumoxide::crypto::secretbox::NONCEBYTES).enumerate() {
        symm_key.0[it.0] = *it.1;
    }

    println!("App: Begin creating directory...");

    // Create a directory
    let create_dir_data = CreateDirData {
        is_path_shared: false,
        dir_path: "/zeroeth".to_string(),
        is_private: true,
        is_versioned: false,
        user_metadata: "ABCD".to_string(),
    };

    let create_dir = CreateDir {
        endpoint: "safe-api/v1.0/nfs/create-dir".to_string(),
        data: create_dir_data,
    };

    let create_dir_json_str = rustc_serialize::json::encode(&create_dir).unwrap_or_else(|a| panic!("{:?}", a));
    println!("App: CreateDir encoded");

    let create_dir_bytes = create_dir_json_str.into_bytes();

    let create_dir_json_str_encrypted = sodiumoxide::crypto::secretbox::seal(&create_dir_bytes,
                                                                             &symm_nonce,
                                                                             &symm_key);
    let response_id = sodiumoxide::crypto::hash::sha512::hash(&create_dir_json_str_encrypted);

    ipc_stream.write(create_dir_json_str_encrypted);

    let payload = ipc_stream.read_payload();
    let payload_decrypted = sodiumoxide::crypto::secretbox::open(&payload,
                                                                 &symm_nonce,
                                                                 &symm_key).unwrap_or_else(|a| panic!("{:?}", a));

    let payload_str = String::from_utf8(payload_decrypted).unwrap_or_else(|a| panic!("{:?}", a));

    let response: GenericResponse = rustc_serialize::json::decode(&payload_str).ok().unwrap();
    println!("App: GenericResponse decoded");

    let rxd_id_vec = response.id.from_base64().ok().unwrap();

    assert!(slice_equal(&rxd_id_vec, &response_id.0[..]));

    println!("App: Response from Launcher: {:?}", response.error);

    // Fetch the created directory
    let get_dir_data = GetDirData {
        timeout_ms: 0,
        is_path_shared: false,
        dir_path: "/zeroeth".to_string(),
    };

    let get_dir_req = GetDir {
        endpoint: "safe-api/v1.0/nfs/get-dir".to_string(),
        data: get_dir_data,
    };

    let json_str = rustc_serialize::json::encode(&get_dir_req).ok().unwrap();
    println!("App: GetDir encoded");

    let json_str_bytes = json_str.into_bytes();
    let encrypted_json_str_bytes = sodiumoxide::crypto::secretbox::seal(&json_str_bytes,
                                                                        &symm_nonce,
                                                                        &symm_key);

    let response_id = sodiumoxide::crypto::hash::sha512::hash(&encrypted_json_str_bytes);
    ipc_stream.write(encrypted_json_str_bytes);

    let response = ipc_stream.read_payload();
    let decrypted_response = sodiumoxide::crypto::secretbox::open(&response,
                                                                  &symm_nonce,
                                                                  &symm_key).ok().unwrap();
    println!("App: GetDir Response decrypted.");

    let decrypted_response_json_str = String::from_utf8(decrypted_response).ok().unwrap();
    println!("App: GetDir Response JSON: {}", decrypted_response_json_str);

    let get_dir_response: GetDirResponse = rustc_serialize::json::decode(&decrypted_response_json_str)
                                                                 .unwrap_or_else(|e| panic!("{:?}", e));
    println!("App: GetDir Response decoded.");

    let rxd_id_vec = get_dir_response.id.from_base64().ok().unwrap();
    assert!(slice_equal(&rxd_id_vec, &response_id.0[..]));

    println!("App: Response: {:?}", get_dir_response);
    println!("App: Exiting test app...");
    println!("\n======================================================");
}
